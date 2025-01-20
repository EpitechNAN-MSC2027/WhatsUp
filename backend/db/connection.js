import {MongoClient} from "mongodb";

const connectionString = "mongodb://root:example@localhost:27017";

export async function connectDB() {
    console.log("Connecting to database...");
    const client = new MongoClient(connectionString);
    console.log(`MongoClient created`);
    try {
        console.log("Connecting to client...");
        let conn = await client.connect();
        console.log("Connected to client");

        return conn.db("IRCEpitech");
    } catch(e) {
        console.error(e);
    }
}

export default connectDB;