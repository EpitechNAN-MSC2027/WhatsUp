import {Server} from "socket.io";
import * as auth from"../services/authentication.js"
import * as commands from "./handleCommands.js";
import * as userService from "../services/userServices.js";
import {User} from "../models/user.js";
import jwt from "jsonwebtoken";

/**
 * Socket wrong args Response template
 * @param socket
 * @param action
 * @returns {Promise<void>}
 */
async function wrongArgsResponse(socket, action) {
    socket.emit('response', {
        status: 'error',
        action,
        message: 'Wrong number of arguments',
        data: null,
        timestamp: new Date().toISOString(),
    })
}

/**
 * Create the Websocket Server and handle client connections
 * @param server
 */
export function createWebsocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token; // From handshake auth or query
        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }

        try {
            //socket.user = auth.decodeToken(token);
            jwt.verify(token, 'secret');
            next(); // Allow the connection
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // Handle connections
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Save token on socket connection
        socket.token = socket.handshake.auth.token || socket.handshake.query.token;

        socket.on('input', async (input) => {
            console.log(`Input: ${input}`);

            if (input.data.startsWith('/')) {
                // Parse the command
                const [fullCommand, ...args] = input.data.slice(1).split(' '); // Remove '/' and split by space
                console.log(fullCommand, args);
                console.log("Type of args:", typeof args);
                const command = fullCommand.toLowerCase(); // Normalize command to lowercase

                console.log(`Command: ${command}, Argument: ${args}`);

                let channel, nickname, filter, user, message; // WIP: To handle better
                // Switch statement to handle commands
                switch (command) {
                    case 'nick':
                        if (args.length !== 1) {
                            await wrongArgsResponse(socket, 'nick');
                            break;
                        }

                        nickname = args[0];
                        await commands.defineNickname(socket, nickname);
                        break;

                    case 'list':
                        if (args.length > 1) {
                            await wrongArgsResponse(socket, 'list');
                            break;
                        }

                        filter = args[0];
                        await commands.listChannels(socket, filter);
                        break;

                    case 'create':
                        if (args.length !== 1) {
                            await wrongArgsResponse(socket, 'create');
                            break;
                        }

                        channel = args[0];
                        await commands.createChannel(socket, channel);
                        break;

                    case 'delete':
                        if (args.length !== 1) {
                            await wrongArgsResponse(socket, 'delete');
                            break;
                        }

                        channel = args[0];
                        await commands.deleteChannel(socket, token, channel);
                        break;

                    case 'join':
                        if (args.length !== 1) {
                            await wrongArgsResponse(socket, 'join');
                            break;
                        }

                        channel = args[0];
                        await commands.joinChannel(socket, channel);
                        break;

                    case 'quit':
                        if (args.length !== 1) {
                            await wrongArgsResponse(socket, 'quit');
                            break;
                        }

                        channel = args[0];
                        await commands.quitChannel(socket, channel);
                        break;

                    case 'users':
                        if (args.length !== 0) {
                            await wrongArgsResponse(socket, 'users');
                            break;
                        }

                        await commands.listUsers(socket);
                        break;

                    case 'msg':
                        if (args.length !== 2) {
                            await wrongArgsResponse(socket, 'msg');
                            break;
                        }

                        user = args[0];
                        message = args[1];
                        await commands.messageUser(io, socket, user, message);
                        break;

                    default:
                        console.error(`Unknown command: ${command}`);

                        socket.emit('response', {
                            status: 'error',
                            action: 'command',
                            message: `Unknown command: ${command}`,
                            data: null,
                            timestamp: new Date().toISOString(),
                        })
                        break;
                }
            } else {
                console.log('Received message:', input.data);
                await commands.sendMessage(io, socket, input.data);
            }
        })

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}
