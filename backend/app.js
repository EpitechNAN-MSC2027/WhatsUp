import express, {json} from 'express';
import { createServer } from 'node:http';
import { createWebsocketServer } from './controller/websocket.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { connectDB } from "./db/connection.js";
import {checkUserCredentials, createToken, hashPassword, registerUser} from "./services/authentication.js";
import {getUser} from "./services/userServices.js";
import {getChannelsCreated, initGeneralChannel} from "./services/channelServices.js";
import cors from 'cors';

const app = express();
const server = createServer(app);
app.use(cors());
app.use(json());
const db = await connectDB();

await initGeneralChannel();
createWebsocketServer(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'testconnection.html'));
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});

app.post("/login", async (req, res) => {

    const {username, password} = req.body;
    console.log(username, password);

    let user = await getUser(username);

    if (!user || (user["password"] !== hashPassword(password))) {
        return res.status(401).json({success: false, message: "Invalid email or password"});
    }

    let channels = await getChannelsCreated(username)
    console.log(channels);
    let jwt = createToken(channels, username);
    return res.status(200).json({success: true, message: "Login successful", token: jwt});

});

app.post("/register", (req, res) => {
    const {username, password, confirmPassword} = req.body;
    console.log(username, password, confirmPassword);
    registerUser(username, password, username).then(r => {
        if (r) {
            return res.status(201).json({success: true, message: "User registered"});
        }
        else {
            return res.status(500).json({success: false, message: "Error during registration"});
        }
    })
});

export default db;
