import {test, expect, beforeAll, beforeEach} from 'vitest'
import db from "../db/connection.js";
import {getAllMessagesFromChannel, writeMessage, getMessagesFromChannelPaginated, deleteMessage} from "../services/messageServices.js";
import {config} from "./utils.mjs";
import {createChannel} from "../services/channelServices.js";
import Message from "../models/message.js";
import {User} from "../models/user.js";


const user = new User("user1", "password1", "hallo", []);
const channel = "channel1";
const user2 = new User("user2", "password2", "hallo", []);
beforeEach(await config);

test("getAllMessagesFromChannel should return all messages from a channel", async () => {
    await writeMessage(user, channel, "Hello World");
    await writeMessage(user2, channel, "Hi there");
    const messages = await getAllMessagesFromChannel("channel1");
    expect(messages.length).toBe(2);
    expect(messages[0].message).toBe("Hello World");
    expect(messages[1].message).toBe("Hi there");
});

test("writeMessage should write a message to the database", async () => {
    await writeMessage( user, channel, "Test message");
    const messages = await db.collection("messages").find({channel: "channel1"}).toArray();
    expect(messages.length).toBe(1);
    expect(messages[0].message).toBe("Test message");
});

test("getMessagesFromChannelPaginated should return paginated messages", async () => {
    const user = new User("user1", "password1", "hallo", []);
    for (let i = 0; i < 10; i++) {
        let res = await writeMessage(user, "channel1", `Message ${i}`);
    }
    const messages = await getMessagesFromChannelPaginated("channel1", 0, 5);
    expect(messages.length).toBe(5);
    expect(messages[0].message).toBe("Message 9");
    expect(messages[4].message).toBe("Message 5");
});

test("getMessagesFromChannelPaginated should throw error if no messages found", async () => {
    await expect(getMessagesFromChannelPaginated("emptyChannel", 0, 5)).resolves.toStrictEqual([]);
});

test("deleteMessage should delete a message from the database", async () => {
    await writeMessage(user, channel, "Message to delete");
    const message = await db.collection("messages").findOne({message: "Message to delete"});
    await deleteMessage(message);
    const deletedMessage = await db.collection("messages").findOne({message: "Message to delete"});
    expect(deletedMessage).toBeNull();
});

test("deleteMessage should throw error if message not deleted", async () => {
    let message = new Message("Message to delete", "user1", "channel1", new Date());
    await expect(deleteMessage(message)).rejects.toThrow("Message not deleted");
});