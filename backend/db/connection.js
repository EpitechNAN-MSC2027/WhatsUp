import { MongoClient } from "mongodb";
import Message from "./models/message";
const connectionString = "mongodb://root:example@localhost:27017";
const client = new MongoClient(connectionString);
let conn;
try {
    conn = await client.connect();
} catch(e) {
    console.error(e);
}
let db = conn.db("IRCEpitech");

export default db;