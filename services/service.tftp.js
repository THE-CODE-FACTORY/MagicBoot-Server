const path = require("path");
const tftp = require("tftp");

const config = require("../config.json").services.tftp;
const log = require("../lib/lib.logger.js")("TFTP");


const queue = require("../lib/lib.queue.js");

// connect to server
queue.connect();


// build path to tftp-root
const root = path.resolve(__dirname, "../", config.root);


// create tftp server
let server = tftp.createServer({
  host: config.host,
  port: config.port,
  root: root,
  denyPUT: true // allow only downloads
});


server.on("error", function (err) {
  if (err.code === "ENOENT") {

    // feedback
    log.error(err, "tftp-root (%s) not found", root);

  } else {

    log.error(err, "Could not start: %s", err.message);
    //process.exit(1000);

  }
});


// listen when server is started
// feedback for better usability
server.on("listening", function () {

  let address = this._socket.address();
  log.info("Server listening on %s:%s", address.address, address.port);

});


// handle tftp request
// here we decide what the computer boot
// image restore or WindowsPE
let connections = require("../lib/lib.filehandler.js")(log, server, queue);


// fire up
server.listen();


queue.on("ftpt.abort", function (ip) {

  // find computer in connection array
  const req = connections.find(entry => {
    return entry._ps._writer._address === ip;
  });

  // feedback
  log.debug("Abort TFTP request (%s)", ip);

  if (req) {

    // remove/abort connections
    req.abort("Forget button hit...");
    connections.splice(connections.indexOf(req), 1);

  } else {

    // feedback
    log.trace("No active connection from %s", ip);

  }

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