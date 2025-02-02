import db from "../db/connection.js";
import Message from "../models/message.js";

/**
 * Gets all messages from a channel
 * @param channel {string}
 * @returns {WithId<Document>[]}
 */
export async function getAllMessagesFromChannel(channel) {
    return await db.collection("messages").find({channel: channel}).toArray();
}

/**
 * Writes a message to the database
 * @param user {User}
 * @param channel {string}
 * @param content {string}
 * @returns {InsertOneResult<Document>}
 */
export async function writeMessage(user, channel, content) {

    let date = new Date();

    let message = new Message(
        content,
        user.nickname,
        channel,
        date
    );
    let response =  await db.collection("messages").insertOne(message.toConst());
    if (!response.acknowledged){
        throw new Error("Message not written");
    }
    return response;
}

/**
 * Gets messages from a channel paginated
 * @param channel {string}
 * @param page {number}
 * @param pageSize {number}
 * @returns {WithId<Document>[]}
 */
export async function getMessagesFromChannelPaginated(channel, page, pageSize) {

    return await db.collection("messages")
        .find({channel: channel})
        .sort({date : -1}) // sort by date descending order
        .skip(page * pageSize)
        .limit(pageSize)
        .toArray();

}


/**
 * Deletes a message from the database
 * @param message {Message} the message to delete
 */
export async function deleteMessage(message) {
    let result = await db.collection("messages").deleteOne({message: message.message, sender: message.sender, channel: message.channel, date: message.date});
    if (result.deletedCount === 0){
        throw new Error("Message not deleted");
    }
    if (!result.acknowledged){
        throw new Error("Error while deleting message");
    }
}
