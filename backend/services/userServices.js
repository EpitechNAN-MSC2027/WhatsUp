import db from "../app";


export function createUser(user) {
    return db.collection("users").insertOne(user.toConst());
}

export function getUser(username) {
    return db.collection("users").findOne({username: username});
}

export function deleteUser(username) {
    return db.collection("users").deleteOne({username: username});
}

export function updateUser(user) {
    return db.collection("users").updateOne({username: user.username}, {$set: user.toConst()});
}