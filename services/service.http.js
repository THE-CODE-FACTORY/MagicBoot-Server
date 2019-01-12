/*const cluster = require("cluster");

const log = require("../lib/lib.logger.js")("HTTP");

if (cluster.isMaster) {
  require("../lib/http.master.js")(log.create("MASTER"));
} else {
  require("../lib/http.worker.js")(log.create("WORKER"));
}
*/


const http = require("http");
//const fs = require("fs");
const express = require("express");
const queue = require("../lib/lib.queue.js");
const db = require("../lib/lib.database.js");

const config = require("../config.json").services.http;
const log = require("../lib/lib.logger.js")("HTTP");


// connect to server
queue.connect();



// create express app
let app = express();


// create standard http server
// and attach socket.io to http server
let server = http.createServer(app);
let io = require('socket.io')(server, {
  pingInterval: 1000,
  pingTimeout: 1800
});


// attach queue & db to app
app.queue = queue;
app.db = db;
app.io = io;


// mount express middleware
app.use(express.static(__dirname + "/../public"));
require(__dirname + "/../routes/index.js")(app);
require("../lib/lib.client.js")(log.create("CLIENT"), app);

server.on("connection", function (socket) {
  //connections.push(socket);
});


const ns = {
  management: io.of("/management"),
  client: io.of("/client")
};


// listen for socket.io connection
// help us debugging
io.on('connection', function (socket) {

  let ip = socket.handshake.address;
  log.debug("socket.io connection from %s", ip);

});



queue.on("update", function (data) {
  ns.management.emit("queue", data);
});


ns.management.on("connection", function (socket) {

  socket.emit("queue", app.queue.computer); // -> master / worker error, note: socket.io handler für multi process

  socket.on("queue", function (data, cb) {
    cb(app.queue.computer);
  });

});



// liste for listening event
server.once('listening', function () {

  let addr = this.address();
  log.info("Server listening on %s:%d", addr.address, addr.port);

});

server.on("error", function (err) {
  log.error(err, "Could not start http service")
});

server.listen(config.port, config.host)