import * as channelService from "../services/channelServices.js";
import * as userService from "../services/userServices.js";
import {addUserToChannel} from "../services/channelServices.js";

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
 * Update the nickname of the current user
 * @param socket
 * @param nickname
 * @returns {Promise<void>}
 */
export async function defineNickname(socket, nickname) {
    console.log(`Define nickname: ${nickname}`);

    try {
        //const newNickname = await process.updateNickname(nickname);
        await userService.updateNickname(socket.id, nickname);
        socket.nickname = nickname;

        await successResponse(
            socket,
            'nick',
            'Nickname defined successfully',
            socket.nickname,
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
        const channel_created = await channelService.createChannel(channel, socket.nickname);

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
        await channelService.deleteChannel(channel);

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

/**
 * Join an existing Channel
 * @param socket
 * @param channel
 * @returns {Promise<void>}
 */
export async function joinChannel(socket, channel) {
    console.log(`Joining channel: ${channel}`);

    try {
        await addUserToChannel(channel, socket.nickname);


    } catch (error) {

    }

    try {

        socket.channel = await channelService.getChannel(channel);
        socket.join(socket.channel);

        await successResponse(
            socket,
            'join',
            `Successfully joined channel ${socket.channel}`,
            socket.channel,
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
            socket.channel = null;
            socket.leave(channel);

            await successResponse(
                socket,
                'quit',
                'Successfully quit channel',
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
        const users = await userService.getAllUsers();

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
            `${socket.nickname}: ${message}`,
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
    console.log('message', message);

    try {
        if (socket.channel) {
            io.to(socket.channel).emit('message',
                `${socket.nickname}: ${message}`,
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