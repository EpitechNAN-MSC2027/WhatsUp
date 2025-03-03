import * as channelService from "../services/channelServices.js";
import * as userService from "../services/userServices.js";
import * as messageService from "../services/messageServices.js";
import {io} from "./websocket.js";
import {PrivateMessage} from "../models/privateMessage.js";

/**
 * Unified response handler
 * @param socket
 * @param {'success' | 'error'} status
 * @param {string} action
 * @param {string} message
 * @param {any} data
 */
export function sendResponse(socket, status, action, message, data = null) {
    socket.emit('response', {
        status,
        action,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Handle typing event
 * @param {*} socket
 * @param {*} data
 */
export async function handleTyping(socket, data) {
    try {
        const { user, channel } = data;
        // Diffuser à tous les utilisateurs du canal que l'utilisateur est en train de taper
        socket.to(channel).emit('userTyping', { user });
    } catch (error) {
        console.error('Error handling typing event:', error);
    }
}

/**
 * Handle stopped typing event
 * @param {*} socket
 * @param {*} data
 */
export async function handleStoppedTyping(socket, data) {
    try {
        const { user, channel } = data;
        // Diffuser à tous les utilisateurs du canal que l'utilisateur a arrêté de taper
        socket.to(channel).emit('userStoppedTyping', { user });
    } catch (error) {
        console.error('Error handling stopped typing event:', error);
    }
}

/**
 * Update socket user
 * @returns {Promise<void>}
 */
export async function updateUser(socket) {
    try {
        socket.user = await retrieveUser(socket.user.username);
        socket.emit('channels', socket.user.channels);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Retrieve user data
 * @param username
 * @returns {Promise<*>}
 */
export async function retrieveUser(username) {
    const [user, channelsCreated] = await Promise.all([
        userService.getUser(username),
        channelService.getChannelsCreated(username)
    ]);

    return {
        username: user.username,
        nickname: user.nickname,
        channels: user.channels,
        channelsAdmin: channelsCreated.map(ch => ch.name),
    };
}

export async function retrieveUserStatus(channel) {
    const channelUsers = await channelService.getChannelUsers(channel);
    const connectedUsernames = new Set(
        Array.from(io.sockets.sockets.values())
            .map(s => s.user?.username)
            .filter(Boolean)
    );
    return channelUsers.map(username => ({
        user: username,
        isConnected: connectedUsernames.has(username)
    }));
}

/**
 * Update user nickname
 * @param socket
 * @param nickname
 * @returns {Promise<void>}
 */
export async function defineNickname(socket, nickname) {
    try {
        await userService.updateNickname(socket.user.username, nickname);
        await updateUser(socket);
        sendResponse(socket, 'success', 'nick', 'Nickname updated', nickname);
    } catch (error) {
        sendResponse(socket, 'error', 'nick', error.message);
    }
}

/**
 * List available channels
 * @param socket
 * @param filter
 * @returns {Promise<void>}
 */
export async function listChannels(socket, filter) {
    try {
        const channels = await channelService.getChannels(filter);
        sendResponse(socket, 'success', 'list', 'Channels retrieved', channels);
    } catch (error) {
        sendResponse(socket, 'error', 'list', error.message);
    }
}

/**
 * Create a channel and join
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function createChannel(socket, channel) {
    try {
        await channelService.createChannel(channel, socket.user.username);
        await userService.joinChannel(socket.user.username, channel);
        await updateUser(socket);
        await connectChannel(socket, channel);
        await sendResponse(socket, 'success', 'create', 'Channel created', channel);
    } catch (error) {
        await sendResponse(socket, 'error', 'create', error.message);
    }
}

/**
 * Delete an existing Channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function deleteChannel(socket, channel) {
    try {
        const room = io.sockets.adapter.rooms.get(channel);
        for (const memberId of room || []) {
            const memberSocket = io.sockets.sockets.get(memberId);
            await quitChannel(memberSocket, channel);
            console.log(`User ${memberSocket.user.username} updated: ${memberSocket.user.channels}`);
        }

        await channelService.deleteChannel(channel, socket.user);
        await sendResponse(socket, 'success', 'delete', `Channel deleted`, channel);
    } catch (error) {
        console.log(error);
        await sendResponse(socket, 'error', 'delete', error.message);
    }
}

/**
 * Connect to channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function connectChannel(socket, channel) {
    try {
        if (socket.channel) {
            socket.leave(socket.channel.name);
        }
        socket.channel = await channelService.getChannel(channel);
        socket.join(channel);
        socket.emit('channel', channel);
        io.to(channel).emit('users', await retrieveUserStatus(channel));
        let messages = await messageService.getAllMessagesFromChannel(channel);
        console.log(messages);
        socket.emit('history', messages.map(msg => ({
            sender: msg.sender,
            message: msg.message,
        })));
    } catch (error) {
        throw error;
    }
}

/**
 * Join an existing Channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function joinChannel(socket, channel) {
    try {
        try {
            await channelService.addUserToChannel(channel, socket.user.username);
            await userService.joinChannel(socket.user.username, channel);
            await updateUser(socket);
        } catch (error) {
            console.log(error.message);
            await sendResponse(socket, 'error', 'join', error.message);
        }

        await connectChannel(socket, channel);
        socket.to(channel).emit('userJoined', socket.user.nickname || socket.user.username);
        await sendResponse(socket, 'success', 'join', 'Joined channel', channel);
    } catch (error) {
        console.log(error);
        await sendResponse(socket, 'error', 'join', error.message);
    }
}

/**
 * Quit the current Channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function quitChannel(socket, channel) {
    if (channel === 'general') {
        await sendResponse(socket, 'error', 'quit', "Can't quit channel general");
        return;
    }
    try {
        let channelToQuit = await channelService.getChannel(channel);
        if (channelToQuit) {
            if (socket.channel.name === channel) {
                socket.leave(channel);
                await connectChannel(socket, 'general');
            }
            await userService.leaveChannel(socket.user.username, channel);
            await channelService.removeUserFromChannel(channel, socket.user.username);
            socket.to(channel).emit('users', await retrieveUserStatus(channel));
            socket.to(channel).emit('userQuit', socket.user.nickname || socket.user.username);
            await updateUser(socket);
            await sendResponse(socket, 'success', 'quit', 'Quit channel', channel);
        }
    } catch (error) {
        console.log(error);
        await sendResponse(socket, 'error', 'quit', error.message);
    }
}

/**
 * Retrieve Users list from the database and forward it to the frontend
 * @returns {Promise<void>}
 */
export async function listUsers(socket) {
    try {
        const users = await channelService.getChannelUsers(socket.channel.name);
        await sendResponse(socket, 'success', 'users', 'User list retrieved', users);
    } catch (error) {
        console.log(error);
        await sendResponse(socket, 'error', 'users', error.message);
    }
}

/**
 * Send a private message to a specific User
 * @param {*} socket
 * @param {*} username
 * @param {*} message
 */
export async function messageUser(socket, username, message) {
    try {
        console.log('Sending private message:', {
            from: socket.user.nickname,
            to: username,
            message: message
        });

        const recipientSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.user?.username === username);

        console.log('Recipient socket found:', recipientSocket?.id);

        if (!recipientSocket) {
            throw new Error(`User ${username} is not connected`);
        }

        const privateMessage = new PrivateMessage(
            socket.user.nickname,
            username,
            message,
            new Date()
        );

        console.log('Sending to recipient:', recipientSocket.id);
        io.to(recipientSocket.id).emit('private_message', privateMessage.toConst());

        console.log('Sending to sender:', socket.id);
        socket.emit('private_message', privateMessage.toConst());

        await sendResponse(socket, 'success', 'msg', `Message sent to ${username}`);
    } catch (error) {
        console.log('Error sending private message:', error);
        await sendResponse(socket, 'error', 'msg', error.message);
    }
}

/**
 * Send a message in the current Channel
 * @param socket
 * @param message
 * @returns {Promise<void>}
 */
export async function sendMessage(socket, message) {
    try {
        messageService.writeMessage(socket.user, socket.channel.name, message);
        console.log(socket.id, "sent", message);
        io.to(socket.channel.name).emit('message', {
            sender: socket.user.nickname,
            message: message,
        });
        await sendResponse(socket, 'success', 'message', 'Message sent');
    } catch (error) {
        console.log(error);
        await sendResponse(socket, 'error', 'message', error.message);
    }
}