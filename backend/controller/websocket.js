import {Server} from "socket.io";
import * as auth from"../services/authentication.js"
import * as cmds from "./handleCommands.js";
import { executeCommand } from "./commands.js";

export let io;

/**
 * WebSocket Server Creation
 * @param server
 */
export function createWebsocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake?.auth?.token;

            if (!token) {
                console.error('Authentication error: Token is missing');
                return next(new Error('Authentication error: Token is required'));
            }

            const payload = auth.verifyToken(token);
            const user = await cmds.retrieveUser(payload['username']);

            if (!user) {
                console.error(`Authentication error: User ${payload.username} not found`);
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                console.error('Authentication error: Invalid token');
                return next(new Error('Authentication error: Invalid token'));
            }
            if (err.name === 'TokenExpiredError') {
                console.error('Authentication error: Token expired');
                return next(new Error('Authentication error: Token expired'));
            }
            console.error('Authentication error:', err.message);
            next(new Error('Authentication error: Internal server error'));
        }
    });

    // Handle connections
    io.on('connection', async (socket) => {
        console.log('Socket connected:', socket.id);

        // Send user channels to client
        socket.emit('channels', socket.user.channels);
        await cmds.connectChannel(socket, 'general');

        socket.on('move', async (channel) => {
            await cmds.connectChannel(socket, channel);

            // Notifier les autres utilisateurs du nouveau canal
            if (socket.channel?.name) {
                socket.to(socket.channel.name).emit('userJoined', socket.user.nickname);
            }
        });

        socket.on('input', async (input) => {
            if (input.data.startsWith('/')) {
                // Parse the command
                const [command, ...args] = input.data.slice(1).split(' '); // Remove '/' and split by space
                executeCommand(socket, command, args);
            } else {
                console.log('Received message:', input.data);
                await cmds.sendMessage(socket, input.data);
            }
        });

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}
