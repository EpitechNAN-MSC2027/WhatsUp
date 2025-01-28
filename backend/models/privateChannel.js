class PrivateChannel {

    /**
     * @type {string}
     */
    name;
    /**
     * @type {User[]}
     */
    users;

    /**
     * @type {Message[]}
     */
    messages;

    /**
     * @param name {string}
     * @param user1 {User}
     * @param user2 {User}
     */
    constructor(name, user1, user2) {
        this.name = name;
        this.users = [user1, user2];
        this.messages = [];
    }

    toConst() {
        return {
            users: this.users
        }
    }

}