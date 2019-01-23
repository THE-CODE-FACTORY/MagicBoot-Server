const dgram = require("dgram");
const services = require("../config.json").services;
const log = require("../lib/lib.logger.js")("AUTODISCOVER");

// shortuct to services
const auto = services.autodiscover;
const http = services.http;
const tftp = services.tftp;
const dhcp = services.http;


const PORT = 6024;
const server = dgram.createSocket("udp4");


// create message
const message = JSON.stringify({
    "http": {
        "protocol": "http",
        "host": auto.host,
        "port": http.port
    },
    "tftp": {
        "protocol": "tftp",
        "host": auto.host,
        "port": tftp.port
    },
    "dhcp": {
        "protocol": "dhcp",
        "host": auto.host,
        "port": dhcp.port
    }
});


// bind server
server.bind(function () {

    const addr = this.address();
    log.debug("Bind to %s:%d", addr.address, addr.port);

    // tell udp to braodcast
    server.setBroadcast(true);

    // send in <x>ms message
    setInterval(function () {
        server.send(message, 0, message.length, PORT, auto.broadcast, function () {

            // feedback
            log.trace("Message send to: %s:%d: ", auto.broadcast, PORT, message);

        });
    }, auto.interval);

});


/*
// client.js

var PORT = 6024;
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    client.setBroadcast(true);
});

client.on('message', function (message, rinfo) {

try{
message = JSON.parse(message);
}catch(err){
	console.log("Could not parse message", err);
}

    console.log('Message from: ' + rinfo.address + ':' + rinfo.port +' - ', message);

});


client.bind(PORT);


*/