import {test, expect, beforeAll, beforeEach} from 'vitest'
import db from "../db/connection.js";
import {PrivateMessage} from "../models/privateMessage.js";
import {config} from "./utils.mjs";

beforeEach(config)

test("should create message", async () => {
    let pm = new PrivateMessage("user1", "user2", "Hello", new Date());
    await db.collection("privateMessages").insertOne(pm.toConst());
    let message = await db.collection("privateMessages").findOne({from: "user1"});
    expect(message).not.toBeNull();
});

test("should get private messages", async () => {
    let pm = new PrivateMessage("user1", "user2", "Hello", new Date());
    await db.collection("privateMessages").insertOne(pm.toConst());
    let messages = await db.collection("privateMessages").find({from: "user1"}).toArray();
    expect(messages.length).toBe(1);
});

