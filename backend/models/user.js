export class User {
    /**
     * @param {String} username
     * @param {String} password
     * @param {String} nickname
     * @param {String[]} channels
     */
    constructor(username, password, nickname, channels){
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.channels = channels;
    }

    toConst() {
        return {
            username: this.username,
            password: this.password,
            nickname: this.nickname,
            channels: this.channels
        }
    }
}