import jwt from 'jsonwebtoken';


const secretKey = process.env.JWT_SECRET || "secret";

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

function decodeToken(token){
    return jwt.decode(token, secretKey);
}

function isUserAdmin(token){
    const decoded = decodeToken(token);
    console.log(decoded);
    return decoded.isAdmin;
}

function authorizeAdmin(req) {
    const token = req.cookies["token"];
    if (token === "" || token === undefined){
        return false;
    }
    return isUserAdmin(token);
}


function getUserId(token){
    const decoded = decodeToken(token);
    return decoded.userId;
}