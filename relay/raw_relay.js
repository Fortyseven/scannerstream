#!/usr/bin/env nodejs

/**
 * This script watches for new lines in a local logfile to be written, buffers 
 * the data, and then sends a POST query to a remote server. There is nothing
 * special about the file being watched, and can be any kind of plaintext 
 * content.
 */

const Tail = require('tail').Tail;
const fs = require('fs');
const request = require('request');

const PATH_LOG = "temp.txt";

const SERVER_HOST = "localhost:5000"; // Localhost for debugging purposes
const SERVER_KEY = "HeyCupheadYesMugman"; // just a simple key to speedbump the kiddies

var line_buffer = [];

// Install the file watcher
const tail = new Tail(PATH_LOG);

tail.on("line", function(data) {
    // Buffer the data until we hit the end, then broadcast it
    if (data.trim().length == 0) {
        var out = "";
        for (var line in line_buffer) {
            out += line_buffer[line] + "\n";
        }

        line_buffer = [];

        broadcast(out);
    } else {
        line_buffer.push(data.trim());
    }
});

/**
 * Sends data to the remote server
 * @param {*} msg 
 */
function broadcast(msg) {
    console.log('>> Sending packet...');
    request.post('http://' + SERVER_HOST + '/update')
        .form({
            'key': SERVER_KEY,
            'msg': msg
        })
}

console.log(`* Monitoring "${ PATH_LOG }"...`);