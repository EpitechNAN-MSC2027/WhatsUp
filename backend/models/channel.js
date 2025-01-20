import db from "../db/connection";

export class Channel {
    constructor(name, administrator, messages, users) {
        this.name = name;
        this.administrator = administrator;
        this.users = users;
    }

    static fromRow(row) {
        return new Channel(row.name, row.administrator, row.users);
    }

    toConst() {
        return {
            name: this.name,
            administrator: this.administrator,
            users: this.users
        };
    }
}