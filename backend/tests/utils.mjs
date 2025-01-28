import db from "../db/connection.js";
import {initGeneralChannel} from "../services/channelServices.js";

export const config = async () => {
    await db.dropCollection("messages");
    await db.dropCollection("channels");
    await db.dropCollection("users");

    await db.createCollection("messages");
    await db.createCollection("channels");
    await db.createCollection("users");

    await initGeneralChannel(db);
};