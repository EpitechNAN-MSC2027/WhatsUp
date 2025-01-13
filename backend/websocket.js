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
        
        socket.on('input', (input) => {
            console.log(`Input: ${input}`);
            
            if (input.startsWith('/')) {
                // Parse the command
                const [fullCommand, ...args] = input.slice(1).split(' '); // Remove '/' and split by space
                const command = fullCommand.toLowerCase(); // Normalize command to lowercase
                const argument = args.join(' '); // Rejoin the remaining parts as the argument

                console.log(`Command: ${command}, Argument: ${argument}`);

                // Use a switch statement to handle commands
                switch (command) {
                    case 'create':
                        if (argument) {
                            console.log(`Creating channel: ${argument}`);

                            // Simulate database logic
                            const channels = ["general", "random"]; // Example: Pretend this is your database
                            if (!channels.includes(argument)) {
                                channels.push(argument); // Add channel to the database
                                socket.emit('response', { type: 'create', message: `Channel "${argument}" created` });
                            } else {
                                socket.emit('response', { type: 'error', message: `Channel "${argument}" already exists` });
                            }
                        } else {
                            console.error('No channel name specified for /create');
                        }
                        break;

                    case 'join':
                        if (argument) {
                            console.log(`Joining channel: ${argument}`);
                            socket.emit('response', { type: 'join', message: `Joined channel "${argument}"` });
                        } else {
                            console.error('No channel name specified for /join');
                        }
                        break;

                    case 'quit':
                        if (argument) {
                            console.log(`Quitting channel: ${argument}`);
                            socket.emit('response', { type: 'quit', message: `Left channel "${argument}"` });
                        } else {
                            console.error('No channel name specified for /quit');
                        }
                        break;

                    case 'delete':
                        if (argument) {
                            console.log(`Deleting channel: ${argument}`);
                            socket.emit('response', { type: 'delete', message: `Channel "${argument}" deleted` });
                        } else {
                            console.error('No channel name specified for /delete');
                        }
                        break;

                    case 'list':
                        console.log('Listing channels');
                        const channels = ["general", "random"]; // Example: Pretend this is your database
                        socket.emit('response', { type: 'list', channels });
                        break;

                    default:
                        console.error(`Unknown command: ${command}`);
                        socket.emit('response', { type: 'error', message: `Unknown command: ${command}` });
                        break;
                }
            } else {
                console.log('Received message:', input);
                socket.emit('response', { type: 'message', text: input });
            }
        })

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });
}
