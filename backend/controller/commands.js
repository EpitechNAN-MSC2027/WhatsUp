import * as cmds from "./handleCommands.js";

/**
 * Response utility for command results
 * @param {string} status - Response status ('success' or 'error')
 * @param {string} action - Command action name
 * @param {string} message - Response message
 * @param {any} data - Optional response data
 */
const sendResponse = (status, action, message, data = null) => {
    console.error("sendResponse", status, action, message, data);
    socket.emit('response', {
        status,
        action,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Validates command arguments against expected count
 * @param {string} command - Command name
 * @param {array} args - Provided arguments
 * @param {number} expectedCount - Expected number of arguments
 * @returns {boolean} - Whether validation passed
 */
const validateArgs = (command, args, { min, max }) => {
    if (args.length < min || args.length > max) {
        sendResponse('error', command, 'Wrong number of arguments');
        return false;
    }
    return true;
};

/**
 * Command handlers with their configurations
 * @type {Object.<string>}
 */
export const commands = {
    nick: {
        argsConfig: { min: 1, max: 1 },
        handler: async (socket, args) => {
            const [nickname] = args
            await cmds.defineNickname(socket, nickname);
        }
    },

    list: {
        argsConfig: { min: 0, max: 1 },
        handler: async (socket, args) => {
            const [filter] = args;
            await cmds.listChannels(socket, filter);
        }
    },

    create: {
        argsConfig: { min: 1, max: 1 },
        handler: async (socket, args) => {
            const [channel] = args;
            await cmds.createChannel(socket, channel);
        }
    },

    delete: {
        argsConfig: { min: 1, max: 1 },
        handler: async (socket, args) => {
            const [channel] = args;
            await cmds.deleteChannel(socket, channel);
        }
    },

    join: {
        argsConfig: { min: 1, max: 1 },
        handler: async (socket, args) => {
            const [channel] = args;
            await cmds.joinChannel(socket, channel);
        }
    },

    quit: {
        argsConfig: { min: 1, max: 1 },
        handler: async (socket, args) => {
            const [channel] = args;
            await cmds.quitChannel(socket, channel);
        }
    },

    users: {
        argsConfig: { min: 0, max: 0 },
        handler: async (socket) => {
            await cmds.listUsers(socket);
        }
    },

    msg: {
        argsConfig: { min: 2, max: 2 },
        handler: async (socket, args) => {
            const [user, message] = args;
            await cmds.messageUser(socket, user, message);
        }
    }
}

/**
 * Command executor that handles validation and execution
 * @param socket
 * @param {string} commandName - Name of the command to execute
 * @param {array} args - Command arguments
 */
export const executeCommand = (socket, commandName, args) => {
    const command = commands[commandName.toLowerCase()];

    if (!command) {
        sendResponse('error', 'command', `Unknown command: ${commandName}`);
        return;
    }

    if (!validateArgs(commandName, args, command.argsConfig)) {
        return;
    }

    try {
        command.handler(socket, args);
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        sendResponse('error', commandName, 'Internal server error');
    }
};