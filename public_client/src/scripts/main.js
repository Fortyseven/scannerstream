/**
 * This script will connect to a websocket server and process incoming
 * messages. It will also keep an eye on how long it's been since the
 * last message and will consider the server down if nothing is received
 * after CONNECTION_TIMEOUT seconds.
 */
const CONNECTION_TIMEOUT = 1000 * 10;
const SERVER_HOST = "http://localhost:5000";

var app = new Vue({
    el: '#App',
    data: {
        messages: [],
        description: "Unnamed",
        user_count: 1,
        my_id: "-1",
        isConnected: false,
        connection_timer: 0,
        isPaused: false
    },
    watch: {
        connection_timer: function() {
            this.isConnected = false;
            if (this.connection_timer > 0) {
                this.isConnected = true;
            }
        }
    }
});

/**
 * This function was for parsing a very specific logfile format; you will need
 * to replace this with your OWN custom decoding, or just pass the data back
 * untouched!
 * 
 * @param {*} data 
 */
function data_decode(data) {
    var id = data.substr(0, 9);
    var date = data.substr(10, 17);
    var type = data.substr(28, 6);
    var msg = '';
    if (data.indexOf('SH/TONE') >= 0 || data.indexOf('BINARY') >= 0) {
        msg = "--DATA--";
    } else {
        var speed_off = data.indexOf('320');
        if (speed_off < 0) {
            speed_off = data.indexOf('640');
        }
        var msg = data.substr(speed_off + 5);
    }

    return {
        id: id,
        date: date,
        type: type,
        msg: msg,
        raw: data
    };
}


var socket = io(SERVER_HOST);

/**
 * This is called when a new text entry is recieved. It can be passed 
 * through a decoding function, where applicable, but is entirely optional
 * if it's just plaintext.
 */
socket.on('entry', function(msg) {
    var out = data_decode(msg);
    app.messages.push(out);
    pong('entry');
});

/**
 * Updates various details about the stream.
 */
socket.on('status', function(data) {
    console.info('recv: status');
    var resp = JSON.parse(data);
    app.user_count = resp.users;
    app.my_id = resp.id;
    app.description = resp.description;
    pong('status');
});

/**
 * Clears the screen.
 */
socket.on('cls', function() {
    console.info('recv: cls');
    app.messages = [];
    pong('cls');
});

/**
 * This will keep the output log constantly scrolling. This can be irritating
 * when trying to read the data, so there is a provision to pause this 
 * behavior.
 */
function scrollDown() {
    if (!app.isPaused) {
        var msgbox = document.getElementById('MessageContainer'); // have to do this because of vuejs?
        msgbox.scrollTop = msgbox.scrollHeight + 1000;
    }
}
setInterval(scrollDown, 500);

function connectionTimer() {
    app.connection_timer -= 500;
}
setInterval(connectionTimer, 500);

/**
 * Keeps the stream considered 'live'. 
 * @param {*} from Used for debugging only!
 */
function pong(from) {
    app.connection_timer = CONNECTION_TIMEOUT;
}