export class PrivateMessage {

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string}
     */
    from;

    /**
     * @type {string}
     */
    to;

    /**
     * @type {string}
     */
    content;

    /**
     * @param content {string}
     * @param from {string}
     * @param to {string}
     * @param date {Date}
     */
    constructor(from, to, content, date) {
        this.from = from;
        this.to = to;
        this.content = content;
        this.date = date;
    }

    toConst() {
        return {
            from: this.from,
            to: this.to,
            content: this.content,
            date: this.date
        }
    }

}