import db from "../app";

/**
 * Creates a user in the database
 * @param user
 * @returns {InsertOneResult<Document>}
 */
export async function createUser(user) {
    return await db.collection("users").insertOne(user.toConst());
}

/**
 * Gets a user from the database
 * @param username the username of the user to get
 * @returns {Document & {_id: InferIdType<Document>}}
 */
export async function getUser(username) {
    return (await db.collection("users").findOne({username: username}));
}

/**
 * Deletes a user from the database
 * @param username
 * @returns {DeleteResult}
 */
export async function deleteUser(username) {
    return await db.collection("users").deleteOne({username: username});
}

/**
 * Updates a user in the database
 * @param username {String} the user to update
 * @param nickname {String} the new nickname
 * @returns {UpdateResult<Document>}
 */
export async function updateNickname(username, nickname) {
    return await db.collection("users").updateOne({username: username}, {$set: {nickname: nickname}});
}