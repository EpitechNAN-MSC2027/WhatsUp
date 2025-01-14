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
