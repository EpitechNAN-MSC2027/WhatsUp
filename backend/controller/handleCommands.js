import * as channelService from "../services/channelServices.js";
import * as userService from "../services/userServices.js";

/**
 * Socket success Response template
 * @param socket
 * @param action
 * @param message
 * @param data
 * @returns {Promise<void>}
 */
async function successResponse(socket, action, message, data) {
    socket.emit('response', {
        status: 'success',
        action,
        message,
        data,
        timestamp: new Date().toISOString(),
    })
}

/**
 * Socket error Response template
 * @param socket
 * @param action
 * @param message
 * @param data
 * @returns {Promise<void>}
 */
async function errorResponse(socket, action, message, data) {
    socket.emit('response', {
        status: 'error',
        action,
        message,
        data,
        timestamp: new Date().toISOString(),
    })
}

/**
 * Socket channels emit template
 * @param socket
 * @param channels
 * @returns {Promise<void>}
 */
async function sendChannels(socket, channels) {
    socket.emit('channels', channels);
}

/**
 *
 * @param socket
 * @returns {Promise<void>}
 */
async function updateUser(socket) {
    try {
        socket.user = await retrieveUser(socket.user.username);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Update the socket user
 * @param username
 * @returns {Promise<*>}
 */
export async function retrieveUser(username) {
    try {
        let user = await userService.getUser(username);
        console.log('user:', user);
        let channelsCreated = await channelService.getChannelsCreated(username);
        console.log('channelsCreated:', channelsCreated);

        let channelsAdmin = [];
        for (let channel of channelsCreated) {
            channelsAdmin.push(channel.channelName);
        }

        let response = {
            username: user['username'],
            nickname: user['nickname'],
            channels: user['channels'],
            channelsAdmin,
        };

        console.log(response);
        return response;
    } catch (error) {
        return error;
    }
}

/**
 * Update the nickname of the current user
 * @param socket
 * @param nickname
 * @returns {Promise<void>}
 */
export async function defineNickname(socket, nickname) {
    console.log(`Define nickname: ${nickname}`);

    try {
        //const newNickname = await process.updateNickname(nickname);
        await userService.updateNickname(socket.user.username, nickname);
        await updateUser(socket);

        await successResponse(
            socket,
            'nick',
            'Nickname defined successfully',
            socket.user.nickname,
        );
    } catch (error) {
        await errorResponse(
            socket,
            'nick',
            `${error}`,
            null,
        );
    }
}

/**
 * Retrieve Channels list from the database and forward it to the frontend
 * @param socket
 * @param filter
 * @returns {Promise<void>}
 */
export async function listChannels(socket, filter) {
    console.log('Listing channels');

    try {
        const channels = await channelService.getChannels(filter);

        await successResponse(
            socket,
            'list',
            'Successfully list channels',
            channels,
        )
    } catch (error) {
        await errorResponse(
            socket,
            'list',
            `${error}`,
            null,
        )
    }
}

/**
 * Create a new Channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function createChannel(socket, channel) {
    console.log(`Creating channel: ${channel}`);

    try {
        try {
            await userService.joinChannel(socket.user.username, channel);
        } catch (error) {
            console.log(error);
        }

        const channel_created = await channelService.createChannel(channel, socket.user.username);

        await updateUser(socket);
        await sendChannels(socket, socket.user.channels);

        await successResponse(
            socket,
            'create',
            'Successfully created channel',
            channel_created,
        )
    } catch (error) {
        await errorResponse(
            socket,
            'create',
            `${error}`,
            null,
        )
    }
}

/**
 * Delete an existing Channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function deleteChannel(socket, channel) {
    console.log(`Deleting channel: ${channel}`);

    try {
        await channelService.deleteChannel(socket.user, channel);
        console.log('Successfully deleting channel');

        await updateUser(socket);
        await sendChannels(socket, socket.user.channels);

        await successResponse(
            socket,
            'delete',
            `Successfully deleted channel: ${channel}`,
            channel,
        )
    } catch (error) {
        await errorResponse(
            socket,
            'delete',
            `${error}`,
            null,
        )
    }
}

export async function connectChannel(socket, channel) {
    try {
        socket.channel = await channelService.getChannel(channel);
        console.log('Connected channel:', socket.channel);
        socket.join(socket.channel.channelName);

        socket.emit('users', socket.channel.users);

        await successResponse(
            socket,
            'connect',
            `Successfully connect to channel: ${socket.channel.channelName}`,
            socket.channel.channelName,
        )
    } catch (error) {
        await errorResponse(
            socket,
            'connect',
            `${error}`,
            null,
        )
    }

}

/**
 * Join an existing Channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function joinChannel(socket, channel) {
    console.log(`Joining channel: ${channel}`);


    try {
        // To modify
        try {
            await channelService.addUserToChannel(channel, socket.user.username);
            await userService.joinChannel(socket.user.username, channel);

            await updateUser(socket);
            await sendChannels(socket, socket.user.channels);
        } catch(error) {
            console.log(error);
        }

        await connectChannel(socket, channel);

        await successResponse(
            socket,
            'join',
            `Successfully joined channel ${channel}`,
            channel,
        )

    } catch (error) {
        console.log(error);

        await errorResponse(
            socket,
            'join',
            `${error}`,
            null,
        )
    }
}

/**
 * Quit the current Channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function quitChannel(socket, channel) {
    console.log(`Quitting channel: ${channel}`);

    try {
        if (channelService.getChannel(channel)) {
            if (socket.channel === channel) {
                socket.leave(channel);
                await connectChannel(socket, 'general');
            }

            await userService.leaveChannel(socket.user.username, channel);

            await updateUser(socket);
            await sendChannels(socket, socket.user.channels);

            await successResponse(
                socket,
                'quit',
                `Successfully quit channel: ${channel}`,
                channel,
            )
        }
    } catch (error) {
        console.log(error);

        await errorResponse(
            socket,
            'error',
            `${error}`,
            null,
        )
    }
}

/**
 * Retrieve Users list from the database and forward it to the frontend
 * @param socket
 * @returns {Promise<void>}
 */
export async function listUsers(socket) {
    console.log('Listing users');

    try {
        const users = await channelService.getChannelUsers(socket.channel);

        await successResponse(
            socket,
            'users',
            'Successfully list users',
            users,
        );
    } catch (error) {
        console.log(error);

        await errorResponse(
            socket,
            'users',
            `${error}`,
            null,
        );
    }
}

/**
 * Private message to a specific User
 * @param io
 * @param socket
 * @param user
 * @param message
 * @returns {Promise<void>}
 */
export async function messageUser(io, socket, user, message) {
    console.log(`Send private message to ${user}`);

    try {
        io.to(user).emit('msg',
            `${socket.user.nickname}: ${message}`,
        )

        await successResponse(
            socket,
            'msg',
            `Successfully send private message to ${user}`,
            null,
        )
    } catch (error) {
        console.log(error);

        await errorResponse(
            socket,
            'msg',
            `${error}`,
            null,
        )
    }
}

/**
 * Send a message in the current Channel
 * @param io
 * @param socket
 * @param message
 * @returns {Promise<void>}
 */
export async function sendMessage(io, socket, message) {
    console.log('message:', message);
    console.log('socket', socket);
    console.log('socket.user:', socket.user);
    console.log('socket.user.nickname:', socket.user.nickname);

    try {
        if (socket.channel) {
            io.to(socket.channel).emit('message',
                `${socket.user.nickname}: ${message}`,
            );

            await successResponse(
                socket,
                'message',
                `Message sent successfully in ${socket.channel}`,
                null,
            )
        } else {
            console.log("User not in a channel");

            await errorResponse(
                socket,
                'message',
                `You're not in a channel`,
                null,
            )
        }
    } catch (error) {
        console.log(error);

        await errorResponse(
            socket,
            'message',
            `${error}`,
            null,
        )
    }
}