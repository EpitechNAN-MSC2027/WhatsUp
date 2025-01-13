import db from "../connection";

export class Channel {
    constructor(name, administrator, messages, users) {
        this.name = name;
        this.administrator = administrator;
        this.messages = messages;
        this.users = users;
    }

    static fromRow(row) {
        return new Channel(row.name, row.administrator, row.messages, row.users);
    }

    toConst() {
        return {
            name: this.name,
            administrator: this.administrator,
            messages: this.messages,
            users: this.users
        };
    }
}