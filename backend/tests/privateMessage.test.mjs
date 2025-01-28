import {test, expect, beforeEach} from 'vitest'
import db from "../db/connection.js";
import {createPrivateChannel, getPrivateChannels, getPrivateChannel, writeMessageToUser, getAllMessagesFromPrivateChannel, deletePrivateChannel} from "../services/privateChannelServices.js";
import {User} from "../models/user.js";
import {PrivateChannel} from "../models/privateChannel.js";
import {Message} from "../models/message.js";
import {config} from "./utils.mjs";

beforeEach(config);

test("createPrivateChannel should create a new private channel", async () => {
    const channel = new PrivateChannel("channel1", ["user1", "user2"]);
    await createPrivateChannel(channel);
    const createdChannel = await db.collection("privateChannels").findOne({name: "channel1"});
    expect(createdChannel).not.toBeNull();
    expect(createdChannel.name).toBe("channel1");
    expect(createdChannel.users).toContain("user1");
    expect(createdChannel.users).toContain("user2");
});

test("createPrivateChannel should throw error if users are the same", async () => {
    const channel = new PrivateChannel("channel1", ["user1", "user1"]);
    await expect(createPrivateChannel(channel)).rejects.toThrow("Private channels must have different users");
});

test("createPrivateChannel should throw error if users are invalid", async () => {
    const channel = new PrivateChannel("channel1", ["user1", null]);
    await expect(createPrivateChannel(channel)).rejects.toThrow("Invalid users");
});

test("createPrivateChannel should throw error if channel already exists", async () => {
    const channel = new PrivateChannel("channel1", ["user1", "user2"]);
    await createPrivateChannel(channel);
    await expect(createPrivateChannel(channel)).rejects.toThrow("Channel already exists");
});

test("getPrivateChannels should return all private channels", async () => {
    const channel1 = new PrivateChannel("channel1", ["user1", "user2"]);
    const channel2 = new PrivateChannel("channel2", ["user3", "user4"]);
    await createPrivateChannel(channel1);
    await createPrivateChannel(channel2);
    const channels = await getPrivateChannels();
    expect(channels.length).toBe(2);
    expect(channels[0].name).toBe("channel1");
    expect(channels[1].name).toBe("channel2");
});

test("getPrivateChannel should return the correct private channel", async () => {
    const channel = new PrivateChannel("channel1", ["user1", "user2"]);
    await createPrivateChannel(channel);
    const fetchedChannel = await getPrivateChannel("channel1");
    expect(fetchedChannel).not.toBeNull();
    expect(fetchedChannel.name).toBe("channel1");
    expect(fetchedChannel.users).toContain("user1");
    expect(fetchedChannel.users).toContain("user2");
});

test("getPrivateChannel should throw error if channel not found", async () => {
    await expect(getPrivateChannel("nonexistentChannel")).rejects.toThrow("Channel not found");
});

test("writeMessageToUser should create a message in the private channel", async () => {
    const sender = new User("user1", "password1", "nickname1", []);
    const receiver = new User("user2", "password2", "nickname2", []);
    await writeMessageToUser(sender, receiver, "Hello");
    const channel = await db.collection("privateChannels").findOne({users: {$all: ["user1", "user2"]}});
    expect(channel.messages.length).toBe(1);
    expect(channel.messages[0].message).toBe("Hello");
});

test("getAllMessagesFromPrivateChannel should return all messages from a private channel", async () => {
    const sender = new User("user1", "password1", "nickname1", []);
    const receiver = new User("user2", "password2", "nickname2", []);
    await writeMessageToUser(sender, receiver, "Hello");
    await writeMessageToUser(receiver, sender, "Hi");
    const messages = await getAllMessagesFromPrivateChannel("user1", "user2");
    expect(messages.length).toBe(2);
    expect(messages[0].message).toBe("Hello");
    expect(messages[1].message).toBe("Hi");
});

test("getAllMessagesFromPrivateChannel should throw error if channel not found", async () => {
    await expect(getAllMessagesFromPrivateChannel("user1", "user3")).rejects.toThrow("Channel not found");
});

test("deletePrivateChannel should delete the private channel", async () => {
    const channel = new PrivateChannel("channel1", ["user1", "user2"]);
    await createPrivateChannel(channel);
    await deletePrivateChannel("channel1");
    const deletedChannel = await db.collection("privateChannels").findOne({name: "channel1"});
    expect(deletedChannel).toBeNull();
});

test("deletePrivateChannel should throw error if channel not deleted", async () => {
    await expect(deletePrivateChannel("nonexistentChannel")).rejects.toThrow("Channel not deleted");
});