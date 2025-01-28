
class Message {

    /**
     *
     * @param message {string}
     * @param sender {string}
     * @param channel {string}
     * @param date {Date}
     */
    constructor(message, sender, channel, date) {
        this.message = message;
        this.sender = sender;
        this.channel = channel;
        this.date = date;
    }

    static fromRow(row) {
        return new Message(row.id, row.message, row.sender, row.receiver, row.date);
    }

    toConst() {
        return {
            message: this.message,
            sender: this.sender,
            channel: this.channel,
            date: this.date
        };
    }
}

export default Message;
