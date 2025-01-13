import db from "./connection";
import {Channel} from "./models/channel";


/**
 * Gets all channels
 * @returns {Promise<WithId<Document>[]>}
 */
export function getAllChannels() {
    return db.collection("channels").find().toArray();
}

/**
 * Deletes a Channel and all messages associated with it
 * @param name
 * @returns {bool}
 */
export async function deleteChannel(name)  {
    let channelResponse = await db.collection("channels").deleteOne({name: name});
    if (!channelResponse.acknowledged) {
        return false;
    }
    else {
        let messagesDeleted= await db.collection("messages").deleteMany({channel: name});
        console.log(messagesDeleted.deletedCount + " messages deleted");
    }
    return true;
}

/**
 * Creates a new channel with the given  username of the creator
 * @param channelName
 * @param username
 * @returns {Promise<InsertOneResult<Document>>}
 */
export function createChannel(channelName, username) {
    let channel = new Channel(channelName, username, [], [username]);
    return db.collection("channels").insertOne(channel.toConst());
}

// ----------------------- Messages -----------------------


/**
 * Gets all messages from a channel
 * @param channel
 * @returns {Promise<WithId<Document>[]>}
 */
export function getAllMessagesFromChannel(channel) {
    return db.collection("messages").find({channel: channel}).toArray();
}

/**
 * Writes a message to the database
 * @param message
 * @returns {Promise<InsertOneResult<Document>>}
 */
export function writeMessage(message) {
    return db.collection("messages").insertOne(message.toConst());
}

/**
 * Gets messages from a channel paginated
 * @param channel
 * @param page
 * @param pageSize
 * @returns {Promise<WithId<Document>[]>}
 */
export function getMessagesFromChannelPaginated(channel, page, pageSize) {
    return db.collection("messages").find({channel: channel}).sort("date", -1).skip(page * pageSize).limit(pageSize).toArray();
}


/**
 * Deletes a message from the database
 * @param message the message to delete
 * @returns {Promise<DeleteResult>} the result of the delete operation
 */
export function deleteMessage(message) {
    return db.collection("messages").deleteOne(message);
}


// ----------------------- Users -----------------------

export function createUser(user) {
    return db.collection("users").insertOne(user.toConst());
}

export function getUser(username) {
    return db.collection("users").findOne({username: username});
}

export function deleteUser(username) {
    return db.collection("users").deleteOne({username: username});
}

export function updateUser(user) {
    return db.collection("users").updateOne({username: user.username}, {$set: user.toConst()});
}
