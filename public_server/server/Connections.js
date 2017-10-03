module.exports = class Connections {
    constructor(message_loop_object) {
        this._connections = [];
        this._messages = message_loop_object;
        this._description = 'Untitled Stream';
    }

    newUser(socket) {
        this._connections.push(socket);
        this.updateStatus();
        this.dumpAllMessagesToUser(socket);
        // console.log(`user added: ${this._connections.length}`);
    }

    removeUser(socket) {
        var pos = this._connections.indexOf(socket);

        if (pos >= 0) {
            this._connections.splice(pos, 1);
            // console.log(`user removed: ${this._connections.length}`);
        }

        this.updateStatus();
        
    }

    dumpAllMessagesToUser(socket) {
        var msgs = this._messages.getAllMessages();
        for (var i = 0; i < msgs.length; i++) {
            socket.emit('entry', msgs[i]);
        }
    }

    updateStatus() {
        for (var i in this._connections) {
            // console.log(`Sending to #${i}: ${this._connections[i].id}`);
            this._connections[i].emit('status', JSON.stringify({
                'users':        this._connections.length,
                'description':  this._description,
                'id':           this._connections[i].id
            }));
        }
    }

    broadcast(msg) {
        this._messages.pushMessage(msg);
        for (var i in this._connections) {
            this._connections[i].emit('entry', msg);
        }
    }

    cls() {
        for (var i in this._connections) {
            this._connections[i].emit('cls');
        }
    }

    setDescription(text) {
        this._description = text;
        this.updateStatus();
    }
}