import {test, expect, beforeAll, beforeEach} from 'vitest'
import db from "../db/connection.js";
import {createUser, getUser, deleteUser, updateNickname, joinChannel, leaveChannel, getAllChannelsFromUser} from "../services/userServices.js";
import {User} from "../models/user.js";
import {config} from "./utils.mjs";

beforeEach(config);

test("createUser should create a new user", async () => {
    const user = new User("user1", "password1", "nickname1", []);
    await createUser(user);
    const createdUser = await db.collection("users").findOne({username: "user1"});
    expect(createdUser).not.toBeNull();
    expect(createdUser.username).toBe("user1");
    expect(createdUser.nickname).toBe("nickname1");
});

test("getUser should return the correct user", async () => {
    const user = new User("user1", "password1", "nickname1", []);
    await createUser(user);
    const fetchedUser = await getUser("user1");
    expect(fetchedUser).not.toBeNull();
    expect(fetchedUser.username).toBe("user1");
    expect(fetchedUser.nickname).toBe("nickname1");
});

test("deleteUser should delete the user", async () => {
    const user = new User("user1", "password1", "nickname1", []);
    await createUser(user);
    await deleteUser("user1");
    const deletedUser = await db.collection("users").findOne({username: "user1"});
    expect(deletedUser).toBeNull();
});

test("updateNickname should update the user's nickname", async () => {
    const user = new User("user1", "password1", "nickname1", []);
    await createUser(user);
    await updateNickname("user1", "newNickname");
    const updatedUser = await db.collection("users").findOne({username: "user1"});
    expect(updatedUser.nickname).toBe("newNickname");
});

test("joinChannel should add a channel to the user's channels", async () => {
    const user = new User("user1", "password1", "nickname1", []);
    await createUser(user);
    await joinChannel("user1", "channel1");
    const updatedUser = await db.collection("users").findOne({username: "user1"});
    expect(updatedUser.channels).toContain("channel1");
});

test("leaveChannel should remove a channel from the user's channels", async () => {
    const user = new User("user1", "password1", "nickname1", ["channel1"]);
    await createUser(user);
    await leaveChannel("user1", "channel1");
    const updatedUser = await db.collection("users").findOne({username: "user1"});
    expect(updatedUser.channels).not.toContain("channel1");
});

test("getAllChannelsFromUser should return all channels of the user", async () => {
    const user = new User("user1", "password1", "nickname1", ["channel1", "channel2"]);
    await createUser(user);
    const channels = await getAllChannelsFromUser("user1");
    expect(channels).toContain("channel1");
    expect(channels).toContain("channel2");
});