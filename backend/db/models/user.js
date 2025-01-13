import {Channel} from "./channel";

class User {
    constructor(username, password, channelsCreated){
        this.username = username;
        this.password = password;
        this.channelsCreated = [];
    }
}