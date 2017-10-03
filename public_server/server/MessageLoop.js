const MAX_MESSAGES = 75;

module.exports = class MessageLoop {
    constructor() {
        this._messages = [];
    }

    pushMessage(msg) {
        this._messages.push(msg);
        if (this._messages.length >= MAX_MESSAGES) {
            this._messages.splice(0, 1); // strip that first entry; never let it grow past MAX_MESSAGES
        }
    }

    getAllMessages() {
        return this._messages;
    }

    cls() {
        this._messages = [];
    }
};