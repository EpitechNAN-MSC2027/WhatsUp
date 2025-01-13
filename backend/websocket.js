import {Server} from "socket.io";


export function createWebsocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://127.0.0.1:3000",
            methods: ["GET", "POST"]
        }
    });

    // Handle connections
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle 'create' event
        socket.on('create', (channelName) => {
            console.log(`Creating channel: ${channelName}`);

            // Simulate database logic
            const channels = ["general", "random"]; // Example: Pretend this is your database
            if (!channels.includes(channelName)) {
                channels.push(channelName); // Add channel to the database
                socket.emit('response', { type: 'create', message: `Channel "${channelName}" created` });
            } else {
                socket.emit('response', { type: 'error', message: `Channel "${channelName}" already exists` });
            }
        });

        // Handle 'join' event
        socket.on('join', (channelName) => {
            console.log(`Joining channel: ${channelName}`);
            socket.emit('response', { type: 'join', message: `Joined channel "${channelName}"` });
        });

        // Handle 'quit' event
        socket.on('quit', (channelName) => {
            console.log(`Quitting channel: ${channelName}`);
            socket.emit('response', { type: 'quit', message: `Left channel "${channelName}"` });
        });

        // Handle 'delete' event
        socket.on('delete', (channelName) => {
            console.log(`Deleting channel: ${channelName}`);
            socket.emit('response', { type: 'delete', message: `Channel "${channelName}" deleted` });
        });

        // Handle 'list' event
        socket.on('list', () => {
            console.log('Listing channels');
            const channels = ["general", "random"]; // Example: Pretend this is your database
            socket.emit('response', { type: 'list', channels });
        });

        // Handle regular messages
        socket.on('message', (text) => {
            console.log('Received message:', text);
            socket.emit('response', { type: 'message', text: text });
        });

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });
}
