import {MongoClient} from "mongodb";

const connectionString = "mongodb://root:example@localhost:27017";

export async function connectDB() {
    const client = new MongoClient(connectionString);
    let conn;
    try {
        conn = await client.connect();
    } catch(e) {
        console.error(e);
    }
    return conn.db("IRCEpitech");
}