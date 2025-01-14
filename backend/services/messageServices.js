import db from "../app.js";
import Message from "../models/message.js";

/**
 * Gets all messages from a channel
 * @param channel
 * @returns {WithId<Document>[]}
 */
export async function getAllMessagesFromChannel(channel) {
    return await db.collection("messages").find({channel: channel}).toArray();
}

/**
 * Writes a message to the database
 * @param user
 * @param channel
 * @param content
 * @returns {InsertOneResult<Document>}
 */
export async function writeMessage(user, channel, content) {

    let date = new Date();

    let message = new Message(
        user,
        channel,
        content,
        date
    );

    let response =  await db.collection("messages").insertOne(message.toConst());
    if (!response.acknowledged){
        throw new Error("Message not written");
    }
}

/**
 * Gets messages from a channel paginated
 * @param channel
 * @param page
 * @param pageSize
 * @returns {WithId<Document>[]}
 */
export async function getMessagesFromChannelPaginated(channel, page, pageSize) {

    let result = await db.collection("messages").find({channel: channel}).sort("date", -1).skip(page * pageSize).limit(pageSize).toArray();
    if(result.length === 0) {
        throw new Error("No messages found");
    }
    return result;
}


/**
 * Deletes a message from the database
 * @param message the message to delete
 */
export async function deleteMessage(message) {
    let result = await db.collection("messages").deleteOne(message);
    if (!result.acknowledged){
        throw new Error("Message not deleted");
    }
}
