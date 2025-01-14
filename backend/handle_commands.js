import * as process from "./data_processing.js";


async function successResponse(socket, action, message, data) {
    socket.emit('response', {
        status: 'success',
        action,
        message,
        data,
        timestamp: new Date().toISOString(),
    })
}

async function errorResponse(socket, action, message, data) {
    socket.emit('response', {
        status: 'error',
        action,
        message,
        data,
        timestamp: new Date().toISOString(),
    })
}


export async function defineNickname(socket, nickname) {
    console.log(`Define nickname: ${nickname}`);
    try {
        const newNickname = await process.updateNickname(nickname);
        socket.nickname = newNickname;

        await successResponse(
            socket,
            'nick',
            'Nickname defined successfully',
            newNickname,
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

export async function listChannels(socket, filter) {
    console.log('Listing channels');

    try {
        let channels;

        if (db_channels.includes(filter)) {
            // Retrieve only corresponding channels
            channels = db_channels.concat(filter);
        } else {
            // Retrieve all channels
            channels = db_channels;
        }

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
            `An error occured: ${error}`,
        )
    }
}

export async function createChannel(socket, channel) {
    console.log(`Creating channel: ${channel}`);

    try {

    } catch (error) {
        await errorResponse(
            socket,
            'createChannel',
            error,
            null,
        )
    }

    if (channel) {


        // Simulate database logic
        if (!db_channels.includes(channel)) {
            db_channels.push(channel); // Add channel to the database

            await successResponse(
                socket,
                'create',
                `Channel "${channel}" created`,
                null,
            )
        } else {
            await errorResponse(
                socket,
                'create',
                `Channel "${channel}" already exists`,
                null,
            )
        }
    } else {
        console.error('No channel name specified for /create');
    }
}

export async function deleteChannel(socket, channel) {
    if (db_channels.includes(channel)) {
        console.log(`Deleting channel: ${channel}`);

        await successResponse(
            socket,
            'delete',
            `Channel "${channel}" deleted`
        )
    } else {
        console.error('No channel name specified for /delete');

        await errorResponse(
            socket,
            'delete',
            "Channel don't exist",
            null,
        )
    }
}

export async function joinChannel(socket, channel) {
    // Need to detect if the channel already exists in the database

    if (db_channels.includes(channel)) {
        console.log(`Joining channel: ${channel}`);

        socket.join(channel);
        socket.channel = channel;

        await successResponse(
            socket,
            'join',
            'Successfully joined',
            null,
        )
    } else {
        console.error("Channel don't exist in database");

        await errorResponse(
            socket,
            'join',
            "Channel don't exist",
            null,
        )
    }
}

export async function quitChannel(socket, channel) {
    if (db_channels.includes(channel)) {
        console.log(`Quitting channel: ${channel}`);

        socket.leave(channel);
        socket.channel = null;

        await successResponse(
            socket,
            'quit',
            'Successfully leaved',
            null,
        )
    } else {
        console.error("Channel don't exist in database");

        await errorResponse(
            socket,
            'quit',
            "Channel don't exist",
            null,
        )
    }
}

export async function listUsers(socket) {
    try {
        const users = await process.listUsers();

        await successResponse(
            socket,
            'users',
            'Successfully list users',
            users,
        );
    } catch (error) {
        await errorResponse(
            socket,
            'users',
            `${error}`,
            null,
        );
    }
}

export async function messageUser(socket, user, message) {

}

export async function sendMessage(io, socket, message) {
    console.log('message', message);

    if (socket.channel) {
        io.to(socket.channel).emit('message',
            `${socket.nickname}: ${message}`,
        );

        await successResponse(
            socket,
            'message',
            'Message sent successfully',
            null,
        )
    } else {
        await errorResponse(
            socket,
            'message',
            'You are not connected to a channel',
            null,
        )
    }
}