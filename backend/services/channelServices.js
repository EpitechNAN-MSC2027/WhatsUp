import db from "../app";


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