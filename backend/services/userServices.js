import db from "../app.js";

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
    /*
    let res = await db.collection("users").findOne({username: username});
    console.log('res', res);

    if (!res) {
        throw new Error(`Could not find user with username ${username}`);
    }

    console.log("username", res.username);
    return ({
        username: res.username,
        password: res.password,
        nickname: res.nickname,
        channels: res.channels,
    });
     */
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


/**
 * Adds a channel to a user
 * @param username
 * @param channel
 * @returns {Promise<UpdateResult<Document>>}
 */
export async function joinChannel(username, channel) {
    return await db.collection("users").updateOne({username: username}, {$push: {channels: channel}});
}


/**
 * Removes a channel from a user
 * @param username
 * @param channel
 * @returns {UpdateResult<Document>}
 */
export async function leaveChannel(username, channel) {
    let res =  await db.collection("users").updateOne({username: username}, {$pull: {channels: channel}});
    if (res.modifiedCount === 0) {
        throw new Error("Channel not removed from user");
    }
    else{
        return res.modifiedCount;
    }
}

/**
 * Gets all channels from a user
 * @param username
 * @returns {Promise<Document & {_id: InferIdType<Document>}>}
 */
export async function getAllChannelsFromUser(username) {
    let res =  await db.collection("users").findOne({username: username}, {projection: {channels: 1, _id: 0}});
    return res.channels;
}


// Need a function to get all users that have joined a specific channel,
// to list the users in the current channel