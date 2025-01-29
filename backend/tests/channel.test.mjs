import {test, expect, beforeEach} from 'vitest'
import db from "../db/connection.js";
import {createChannel, initGeneralChannel, getChannels, getChannel, deleteChannel, addUserToChannel, removeUserFromChannel, getChannelUsers, getChannelsCreated} from "../services/channelServices.js";
import Message from "../models/message.js";
import {User} from "../models/user.js";
import {config} from "./utils.mjs";

beforeEach(await config);

test("initGeneralChannel should create general channel if it does not exist", async () => {
    await initGeneralChannel(db);
    const channel = await db.collection("channels").findOne({name: "general"});
    expect(channel).not.toBeNull();
});

test("createChannel should create a new channel", async () => {
    await createChannel("testChannel", "testUser");
    const channel = await db.collection("channels").findOne({name: "testChannel"});
    expect(channel).not.toBeNull();
    expect(channel.name).toBe("testChannel");
    expect(channel.administrator).toBe("testUser");
});

test("createChannel should throw error if channel already exists", async () => {
    await createChannel("duplicateChannel", "testUser");
    await expect(createChannel("duplicateChannel", "testUser")).rejects.toThrow("Channel already exists");
});

test("getChannels should return all channels", async () => {
    await createChannel("channel1", "user1");
    await createChannel("channel2", "user2");
    const channels = await getChannels();
    expect(channels).toContain("channel1");
    expect(channels).toContain("channel2");
});

test("getChannel should return the correct channel", async () => {
    await createChannel("specificChannel", "specificUser");
    const channel = await getChannel("specificChannel");
    expect(channel.name).toBe("specificChannel");
    expect(channel.administrator).toBe("specificUser");
});

test("deleteChannel should delete the channel and its messages", async () => {
    await createChannel("deleteChannel", "adminUser");
    await db.collection("messages").insertOne( new Message("message", "adminUser", "deleteChannel", new Date()).toConst());
    await deleteChannel("deleteChannel", "adminUser");
    const channel = await db.collection("channels").findOne({name: "deleteChannel"});
    const messages = await db.collection("messages").find({name: "deleteChannel"}).toArray();
    expect(channel).toBeNull();
    expect(messages.length).toBe(0);
});

test("addUserToChannel should add a user to the channel", async () => {
    await createChannel("addUserChannel", "adminUser");
    await addUserToChannel("addUserChannel", "newUser");
    const channel = await getChannel("addUserChannel");
    expect(channel.users).toContain("newUser");
});

test("removeUserFromChannel should remove a user from the channel", async () => {
    await createChannel("removeUserChannel", "adminUser");
    await addUserToChannel("removeUserChannel", "userToRemove");
    await removeUserFromChannel("removeUserChannel", "userToRemove");
    const channel = await getChannel("removeUserChannel");
    expect(channel.users).not.toContain("userToRemove");
});

test("getChannelUsers should return all users in the channel", async () => {
    await createChannel("getUsersChannel", "adminUser");
    await addUserToChannel("getUsersChannel", "user1");
    await addUserToChannel("getUsersChannel", "user2");
    const users = await getChannelUsers("getUsersChannel");
    expect(users).toContain("user1");
    expect(users).toContain("user2");
});

test("getChannelsCreated should return all channels created by a user", async () => {
    await createChannel("createdChannel1", "creatorUser");
    await createChannel("createdChannel2", "creatorUser");
    const channels = await getChannelsCreated("creatorUser");
    expect(channels.map(channel => channel.name)).toContain("createdChannel1");
    expect(channels.map(channel => channel.name)).toContain("createdChannel2");
});

test("should create a channel and not throw", async () => {

    await expect(
        createChannel("test")
    ).not.resolves.toThrow();
});

test("should create a channel and try to create it again and should throw", async () => {
    await createChannel("test");
    await expect(
        createChannel("test")
    ).rejects.toThrow("Channel already exists");
});

test("should add a user to a channel", async () => {
    await createChannel("test")
    let user = new User("john", "password", "John", []);
    await expect (
        addUserToChannel("test", user.username)
    ).not.resolves.toThrow();
});

test("should try to add a user and throws user already created", async () => {
    await createChannel("test");
    let user = new User("john", "password", "John", []);
    await addUserToChannel("test", user.username);
    await expect(
        addUserToChannel("test", user.username)
    ).rejects.toThrow("User already in channel");
});

test("should try to add a user to a non existing channel", async () => {
    let user = new User("john", "password", "John", []);
    await expect(
        addUserToChannel("test", user.username)
    ).rejects.toThrow("Channel not found");
});

test("should remove a user from channel users", async () => {
    let username = "john";
    await createChannel("test", "admin");
    await addUserToChannel("test", username);
    await expect(
        removeUserFromChannel("test", username)
    ).not.resolves.toThrow();

    const channel = await getChannel("test");
    expect(channel.users).not.toContain(username);
});
