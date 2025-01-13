import {Channel} from "./channel";

class User {
    constructor(username, password, nickname){
        this.username = username;
        this.password = password;
        this.nickname = nickname;
    }

    toConst() {
        return {
            username: this.username,
            password: this.password,
            nickname: this.nickname
        }
    }
}