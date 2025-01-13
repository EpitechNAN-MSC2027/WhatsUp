import jwt from 'jsonwebtoken';
import {getUser} from "./db/services";
import db from "./db/connection";
import crypto from "crypto";


const secretKey = process.env.JWT_SECRET || "secret";

/**
 * Hashes a password using sha256
 * @param password the password to hash
 * @returns {string} the hashed password
 */
function hashPassword(password){
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Creates a jwt token containing the channels the user administrates
 * @param channelsAdmin
 * @param username
 * @returns {*}
 */
export function createToken(channelsAdmin, username) {
    return jwt.sign(
        {username: username, channelsAdmin : channelsAdmin},
        secretKey,
        {expiresIn: '1h',}
    );
}

/**
 * Checks if a user matches a username and password in the database
 * @param username the username
 * @param password the password
 * @returns {Promise<boolean>} true if the user exists and the password matches
 */
export async function checkUserCredentials(username, password) {
    if (username === undefined || password === undefined) {
        return false;
    }
    let res = await getUser(username)
    if (res === null) {
        return false;
    }
    return res.password === hashPassword(password);
}

/**
 * Registers a new User in the database
 * @param username the username
 * @param password the password
 * @param nickname the nickname
 * @returns {Promise<boolean>} returns the promise of a boolean
 */
export async function registerUser(username, password, nickname) {
    let user = {username: username, password: hashPassword(password), nickname: nickname};
    let result = await db.collection("users").findOne({username: username});
    if (result !== null){
        console.log("User already exists");
        return false;
    }
    let insertResponse = await db.collection("users").insertOne(user);
    return insertResponse.acknowledged;
}


/**
 * Decodes the jwt token into Json format
 * @param token the jwt
 * @returns {{payload: *, signature: *, header: *}|*}
 */
function decodeToken(token){
    return jwt.decode(token, secretKey);
}

/**
 * Checks with a token if a user is an admin of a channel
 * @param token the jwt
 * @param channel the targeted channel
 * @returns {boolean} true if the user is an admin of the channel
 */
function isUserAuthorizedOnChannel(token, channel){
    const decoded = decodeToken(token);
    return decoded.channels.contains(channel);
}