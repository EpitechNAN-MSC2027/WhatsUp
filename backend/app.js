import express from 'express';
import { createServer } from 'node:http';
import { createWebsocketServer } from './controller/websocket.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { connectDB } from "./db/connection.js";


const app = express();
const server = createServer(app);
const db = await connectDB();
createWebsocketServer(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'testconnection.html'));
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});


export default db;
