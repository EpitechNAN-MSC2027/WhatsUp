import db from "../db/connection.js";
import {initGeneralChannel} from "../services/channelServices.js";

export const config = async () => {
    const collections = await db.collections();
    for (const collection of collections) {
        await db.collection(collection.collectionName).deleteMany({});
    }

    await db.createCollection("messages");
    await db.createCollection("channels");
    await db.createCollection("users");
    await db.createCollection("privateChannels");

    await initGeneralChannel(db);
};