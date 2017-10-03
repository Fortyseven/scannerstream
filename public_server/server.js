#!/usr/bin/env nodejs

const Connections = require('./server/Connections');
const MessageLoop = require('./server/MessageLoop');
const crypto = require('crypto');

const SERVER_PORT = '5000';

// This hash  matches the sample key in the relay project; CHANGE THIS. And no, this 
// is NOT the key I've used in the past. I didn't "aaccidentally post my password to 
// git".
const HASH_256 = 'd0a25b3586c4458e7aadc93d7821133265f962c98e9b6f79e9894498f58a1b11';

function getSha256fromString(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// You can uncomment these lines to quickly generate the hash value you'll need.
//console.log(getSha256fromString('')); 
//return;

class ScannerStatus {
    constructor() {
        this.mDescription = "Untitled";
    }

    get Description() {
        return this.mDescription;
    }

    set Description(text) {
        this.mDescription = text;
    }
}

/* ----------------------------------------------------------- */
class ScannerServer {
    constructor() {
        this.mStatus = new ScannerStatus();

        this._messages = new MessageLoop();
        this._connections = new Connections(this._messages);


        this._express = require('express');
        this._app = this._express();

        var bodyParser = require('body-parser');
        this._app.use(bodyParser.json()); // support json encoded bodies
        this._app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

        this._http = require('http').Server(this._app);
        this._io = require('socket.io')(this._http);

        this._line_buffer = [];

        this.initAdmin();
        this.initSocketIO();

        for (var i = 0; i < 500; i++) {
            this._messages.pushMessage(i);
        }

        this._commands = [];

        this.initCommands();

    }

    /**
     * Initialize panel commands
     */
    initCommands() {
        this._commands.cls = function() {
            this._messages.cls();
            this._connections.cls();
            return true;
        }.bind(this);

        this._commands.description = function(req, res) {
            if (req.query.description) {
                this._connections.setDescription(req.query.description);
                return true;
            }
            return false;
        }.bind(this);
    }

    /**
     * Check if a valid key was passed. This is not intended to be some iron-clad
     * security code -- just a speed bump. More secure communication between relay
     * and server is left as an exercise for the reader.
     * 
     * @param {bool} is_post True if key was passed in a POST request, otherwise GET
     * @param {object} req The request object
     */
    isValidKey(is_post, req) {
        if (is_post && req.body.key && getSha256fromString(req.body.key) == HASH_256) {
            return true;
        }
        if (req.query.key && getSha256fromString(req.query.key) == HASH_256) {
            return true;
        }

        return false;
    }

    /**
     * Setup backend panel API
     */
    initAdmin() {
        this._app.post('/update', function(req, res) {
            if (this.isValidKey(true, req) && req.body.msg) {
                //console.log("got valid key + content");
                this._connections.broadcast(req.body.msg);
                res.send("ok");
                return;
            }
            //console.log("got bad key + content");
            res.send("err");
        }.bind(this));

        this._app.get('/cmd', function(req, res) {
            var action = req.query.action;

            if (this.isValidKey(false, req) && typeof this._commands[action] === 'function') {
                if (this._commands[action](req, res)) {
                    return res.send('ok');
                }
            }

            res.send(`err: ${action}`);
        }.bind(this));
    }

    /**
     * Setup socket.io related to client communications
     */
    initSocketIO() {
        this._io.on('connection', function(conn_socket) {
            this._connections.newUser(conn_socket);

            conn_socket.on('disconnect', function() {
                this._connections.removeUser(conn_socket);
            }.bind(this));

        }.bind(this));
    }

    /**
     * Execute run loop
     */
    run() {
        this._http.listen(SERVER_PORT, function() {
            console.log(`* Listening on ${SERVER_PORT}...`);
        });
    }
};

var server = new ScannerServer();
server.run();