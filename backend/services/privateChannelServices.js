import db from "../db/connection.js";
import Message from "../models/message.js";

/**
 *
 * @param channel {PrivateChannel}
 * @returns {InsertOneResult<TSchema>>}
 */
export async function createPrivateChannel(channel) {
    if (channel.users.length !== 2) {
        throw new Error("Private channels must have exactly 2 users");
    }
    if (channel.users[0] === channel.users[1]){
        throw new Error("Private channels must have different users")
    }
    if (channel.users[0] == null || channel.users[1] == null) {
        throw new Error("Invalid users");
    }

    let exist = db.collection("privateChannels").findOne({users: {$all: channel.users}});

    if (exist) {
        throw new Error("Channel already exists");
    }
    if (channel.name == null) {
        throw new Error("Invalid channel name");
    }

    return await db.collection("privateChannels").insertOne(channel.toConst());
}

/**
 * Gets all private channels
 * @returns {PrivateChannel[]}
 */
export async function getPrivateChannels() {
    return await db.collection("privateChannels").find({}).toArray();
}

/**
 * Gets a private channel by its name
 * @param name
 * @returns {PrivateChannel}
 */
export async function getPrivateChannel(name) {
    return await db.collection("privateChannels").findOne({
        name: name
    });
}

/**
 * creates a message in the private channel or creates a private channel before creating the message
 * @param sender {User}
 * @param receiver {User}
 * @param message {string}
 * @returns {Promise<void>}
 */
export async function writeMessageToUser(sender, receiver, message) {
    let channel = await db.collection("privateChannels").findOne({users: {$all: [sender.username, receiver.username]}});
    if (channel == null) {
        await createPrivateChannel(new PrivateChannel(sender.username + "-" + receiver.username, sender, receiver));
    }
    let date = new Date();
    let messageObj = new Message(message, sender.username, channel.name, date);
    channel.messages.push(messageObj);
    await db.collection("privatesChannels").updateOne({name: channel.name}, {$push: {messages: messageObj}});
}

/**
 * Gets all messages from a private channel
 * @returns {Message[]}
 * @param username1 {string}
 * @param username2 {string}
 */
export async function getAllMessagesFromPrivateChannel(username1, username2) {
    let channel = await getPrivateChannel(username1 + "-" + username2);
    if (channel == null) {
        throw new Error("Channel not found");
    }
    return channel.messages;
}

/**
 * Deletes a private channel
 * @param name
 * @returns {Promise<void>}
 */
export async function deletePrivateChannel(name) {
    let res = await db.collection("privateChannels").deleteOne({name: name});
    if (!res.acknowledged) {
        throw new Error("Channel not deleted");
    }
}
