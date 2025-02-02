import {MongoClient} from "mongodb";

const connectionString = "mongodb://root:example@localhost:27017";

let conn;
console.log("Connecting to database...");
const client = new MongoClient(connectionString);
console.log(`MongoClient created`);
try {
    console.log("Connecting to client...");
    conn = await client.connect();
    console.log("Connected to client");
} catch(e) {
    console.error(e);
}

const db = conn.db("IRCEpitech");


export default db;