const http = require("http");
//const fs = require("fs");
const express = require("express");

const queue = require("../lib/lib.queue.js");
const db = require("../lib/lib.database.js");

const config = require("../config.json").services.http;

// connect to server
queue.connect();


module.exports = function (log) {

  let connections = [];

  // create express app
  let app = express();


  // create standard http server
  // and attach socket.io to http server
  // DONT fire up, connection handled from master
  let server = http.createServer(app);
  let io = require('socket.io')(server);


  // attach queue & db to app
  app.queue = queue;
  app.db = db;
  app.io = io;


  // mount express middleware
  app.use(express.static(__dirname + "/../public"));
  require(__dirname + "/../routes/index.js")(app);
  require("./lib.client.js")(log, app);

  server.on("connection", function (socket) {
    connections.push(socket);
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


  ns.management.on("connection", function (socket) {

    socket.emit("queue", app.queue);

  });


  // wait on connection from master
  // so we can handle the request in the worker
  process.on('message', function (msg, socket) {

    if (msg !== 'sticky:balance' || !socket) {
      return;
    }

    log.trace("Handle connection/socket");

    server._connections++;
    socket.server = server;
    server.emit('connection', socket);

  });



  process.on("message", function (event) {
    if (event === "shutdown") {

      // feedback
      log.trace("Graceful shutdown...");

      server.on("close", function () {

        log.info("Server closed");
        process.exit(0);

      });

      // close server
      server.close();

      // close sockets
      connections.forEach(function (socket) {
        socket.destroy();
      });

    }
  });

  server.listen(config.port, config.host);


};