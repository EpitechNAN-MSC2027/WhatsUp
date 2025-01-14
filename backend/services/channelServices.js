import db from "../app";


/**
 * Gets all channels
 * @returns {WithId<Document>[]}
 * @throws Error if no channels were found
 */
export async function getAllChannels() {
    let res = await db.collection("channels").find().toArray();
    if( res.length === 0 ) {
        throw new Error("No channels found");
    }
    else {
        return res;
    }
}

/**
 * @param channelName the name of the channel to check
 * @returns {String} the name of the channel
 */
export async function getChannel(channelName) {
    let res = await db.collection("channels").findOne({name: channelName});
    if( res.length === 0 ) {
        throw new Error("Channel not found");
    }
    return res.name;
}

/**
 * Deletes a Channel and all messages associated with it
 * @param name
 * @throws an error if the channel was not found
 */
export async function deleteChannel(name)  {
    let channelResponse = await db.collection("channels").deleteOne({name: name});
    if (!channelResponse.acknowledged) {
        throw new Error("Channel not found")
    }
    let deletedCount =  (await db.collection("messages").deleteMany({channel: name})).deletedCount;

    console.log("Channel deleted");
    console.log("Messages deleted : " + deletedCount);
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
        messages: [],
        users : [username]
    }

    let createResponse = await db.collection("channels").insertOne(channel);
    if (!createResponse.acknowledged) {
        throw new Error("Channel not created")
    }
}