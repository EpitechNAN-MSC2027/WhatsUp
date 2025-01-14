import db from "../app";


export async function createUser(user) {
    return await db.collection("users").insertOne(user.toConst());
}

export async function getUser(username) {
    return await db.collection("users").findOne({username: username});
}

export async function deleteUser(username) {
    return await db.collection("users").deleteOne({username: username});
}

export async function updateUser(user) {
    return await db.collection("users").updateOne({username: user.username}, {$set: user.toConst()});
}