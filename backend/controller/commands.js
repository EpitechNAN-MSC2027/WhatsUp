import * as cmds from "./handleCommands.js";

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
        argsConfig: { min: 2, max: Infinity },
        handler: async (socket, args) => {
            const [user, ...messageParts] = args;
            const message = messageParts.join(' ');
            await cmds.messageUser(socket, user, message);
        }
    }
}

/**
 * Command executor that handles validation and execution
 * @param {Object} socket - The socket object
 * @param {string} commandName - Name of the command to execute
 * @param {array} args - Command arguments
 */
export const executeCommand = (socket, commandName, args) => {
    const command = commands[commandName.toLowerCase()];

    if (!command) {
        cmds.sendResponse(socket, 'error', 'command', `Unknown command: ${commandName}`);
        return;
    }

    const { min, max } = command['argsConfig'];
    if (args.length < min || args.length > max) {
        cmds.sendResponse(socket,'error', command, 'Wrong number of arguments');
        return;
    }

    try {
        command['handler'](socket, args);
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        cmds.sendResponse(socket, 'error', commandName, 'Internal server error');
    }
};