
import {PrivateMessage} from '../models/privateMessage.js';
import db from "../db/connection.js";

export async function createPrivateMessage(message, sender, receiver) {
    let msg =  new PrivateMessage(message, sender, receiver, new Date());
    await db.collection("privateMessages").insertOne(msg.toConst());
}

export async function getPrivateMessages(sender, receiver) {
    let res = await db.collection("privateMessages").find({from: sender, to: receiver}).toArray();
    return res.map(msg => new PrivateMessage(msg.from, msg.to, msg.content, msg.date));
}

export async function getPrivateMessagesTo(receiver) {
    let res = await db.collection("privateMessages").find({to: receiver}).toArray();
    return res.map(msg => new PrivateMessage(msg.from, msg.to, msg.content, msg.date));
}

export async function getPrivateMessagesFrom(sender) {
    let res = await db.collection("privateMessages").find({from: sender}).toArray();
    return res.map(msg => new PrivateMessage(msg.from, msg.to, msg.content, msg.date));
}

export async function deletePrivateMessages(sender, receiver) {
    await db.collection("privateMessages").deleteMany({from: sender, to: receiver});
}