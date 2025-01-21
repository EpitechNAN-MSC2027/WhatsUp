import db from "../app.js";
import {isUserAuthorizedOnChannel} from "./authentication.js";


/**
 * Gets all channels with an optional filter on the name that does the LIKE operation
 * @returns {WithId<Document>[]}
 * @throws Error if no channels were found
 */
export async function getChannels(filter) {
    let res;
    if (filter) {
        let regexPattern = `.* {${filter}}.*`
        res = await db.collection("channels")
            .find({ name: new RegExp(regexPattern) }, { projection: { name: 1, _id: 0 } })
            .toArray();
    } else {
        res = await db.collection("channels")
            .find({}, { projection: { channelName: 1, _id: 0 } })
            .toArray();
    }

    if( res.length === 0 ) {
        throw new Error("No channels found");
    }
    else {
        return res.map(channel => channel.channelName);
    }
}

/**
 * @param channelName the name of the channel to check
 * @returns {String} the name of the channel
 */
export async function getChannel(channelName) {
    let res = await db.collection("channels").findOne({channelName: channelName});
    if (!res) {
        throw new Error("Channel not found");
    }
    return res.channelName;
}

/**
 * Deletes a Channel and all messages associated with it
 * @param token
 * @param channelName
 * @throws an error if the channel was not found
 */
export async function deleteChannel(token, channelName)  {
    if (isUserAuthorizedOnChannel(token, channelName)) {
        let channelResponse = await db.collection("channels").deleteOne({name: name});
        if (channelResponse.deletedCount === 0) {
            throw new Error("Channel not found")
        }
        let deletedMessagesCount =  (await db.collection("messages").deleteMany({channel: name})).deletedCount;

        console.log("Channel deleted");
        console.log("Messages deleted : " + deletedMessagesCount);
    } else {
        return new Error("Unauthorized operation: you are not the admin of the channel.");
    }
}

/**
 * Creates a new channel with the given  username of the creator
 * @param channelName the name of the channel to create
 * @param username the username (id) of the creator
 * @throws an error if the channel already exists
 * @throws an error if the channel was not created
 */
export async function createChannel(channelName, username) {

    // does the channel already exists?
    let res = await db.collection("channels").find({name: channelName}).toArray();
    if( res.length !== 0 ) {
        throw new Error("Channel already exists");
    }

    // create the channel
    let channel = {
        channelName : channelName,
        username : username,
        users : [username]
    }

    let createResponse = await db.collection("channels").insertOne(channel);
    if (!createResponse.acknowledged) {
        throw new Error("Channel not created")
    }
}

/**
 * Adds a user to a channel
 * @param channelName
 * @param username
 * @returns {Promise<void>}
 */
export async function addUserToChannel(channelName, username) {
    let res = await db.collection("channels").findOne({name: channelName});
    if( res.length === 0 ) {
        throw new Error("Channel not found");
    }
    let isUserPresent = res.users.includes(username);
    if (isUserPresent) {
        throw new Error("User already in channel");
    }
    let updateResponse = await db.collection("channels").updateOne({name: channelName}, {$push: {users: username}});
    if (!updateResponse.acknowledged) {
        throw new Error("User not added to channel")
    }
}

/**
 * Removes a user from a channel
 * @param channelName
 * @param username
 * @returns {Promise<void>}
 */
export async function removeUserFromChannel(channelName, username) {
    let res = await db.collection("channels").findOne({name: channelName});
    if( res.length === 0 ) {
        throw new Error("Channel not found");
    }
    let updateResponse = await db.collection("channels").updateOne({name: channelName}, {$pull: {users: username}});
    if (!updateResponse.acknowledged) {
        throw new Error("User not removed from channel")
    }
}

/**
 * Gets all users from a channel
 * @param channelName
 * @returns {Promise<[*]|*>}
 */
export async function getChannelUsers(channelName) {
    let res = await db.collection("channels").findOne({name: channelName});
    if( res.length === 0 ) {
        throw new Error("Channel not found");
    }
    return res.users;
}

/**
 * Gets the creator of a channel
 * @param username
 * @returns
 */
export async function getChannelsCreated(username) {
    let res = await db.collection("channels").find({administrator: username});
    if( res.length === 0 ) {
        throw new Error("Channel not found");
    }
    return await res.toArray();
}
