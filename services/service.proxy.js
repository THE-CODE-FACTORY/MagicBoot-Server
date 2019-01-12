const net = require("net");
const config = require("../config.json").images;
const url = require("url");
const log = require("../lib/lib.logger.js")("PROXY");

return;

var clients = {};
var target = new url.URL(config.location);

var connections = [];




if (config.proxy.enabled && config.external) {

  // feedback
  log.debug("Redirect data from %s:%d to %s:%d", target.host, target.port, config.proxy.host, config.proxy.port);

  // create server
  // pass data between client & target
  // messure traffic for each connection
  let server = net.createServer(function (socket) {

    socket.setEncoding("utf8");
    connections.push(socket);


    socket.on("close", function () {
      connections.splice(connections.indexOf(socket), 1);
    })


    let client = new net.Socket();
    client.connect(target.port || 80, target.host);

    client.on("error", function (err) {
      if (err.code !== 'ECONNRESET') {

        log.error(err, "PROXY ERROR");

      }
    });

    if (!clients[socket.remoteAddress]) {
      clients[socket.remoteAddress] = {
        send: 0,
        received: 0
      };
    }



    socket.on('connect', function (data) {
      console.log(">>> connection #%d from %s:%d", server.connections, socket.remoteAddress, socket.remotePort);
    });


    socket.on('data', function (data) {



      clients[socket.remoteAddress].send += data.length;

      console.log("%s:%d - Client to Server (IIS) >>", socket.remoteAddress, socket.remotePort);
      console.log();
      console.log(data);
      console.log()
      console.log()
      console.log()

      var flushed = client.write(data);

      if (!flushed) {
        console.log("  remote not flushed; pausing local");
        socket.pause();
      }

    });


    client.on('data', function (data) {




      clients[socket.remoteAddress].received += data.length;

      console.log("%s:%d - Server (IIS) to client >>", socket.remoteAddress, socket.remotePort);
      console.log()
      console.log(data.toString("utf8"));
      console.log()
      console.log()
      console.log()

      var flushed = socket.write(data);

      if (!flushed) {
        console.log("  local not flushed; pausing remote");
        client.pause();
      }

    });


    socket.on('drain', function () {
      console.log("%s:%d - resuming remote", socket.remoteAddress, socket.remotePort);
      client.resume();
    });


    client.on('drain', function () {
      console.log("%s:%d - resuming local", socket.remoteAddress, socket.remotePort);
      socket.resume();
    });


    socket.on('close', function (had_error) {
      //delete connections[socket.remoteAddress];
      console.log("%s:%d - closing remote", socket.remoteAddress, socket.remotePort);
      client.end();
    });


    client.on('close', function (had_error) {
      //delete connections[socket.remoteAddress];
      console.log("%s:%d - closing local", socket.remoteAddress, socket.remotePort);
      socket.end();
    });

  });

  server.on("error", function (err) {
    if (err.code !== 'ECONNRESET') {

      console.log("PROXY ERROR:", err);

    }
  });


  server.on("listening", function () {


    let addr = this.address();
    log.info(" Server listening on %s:%d", addr.address, addr.port);

  });

  // start server
  server.listen(config.proxy.port, config.proxy.host);


  setInterval(function () {
    //console.log(connections);
  }, 5000);






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

}