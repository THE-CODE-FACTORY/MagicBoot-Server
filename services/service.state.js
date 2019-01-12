const net = require("net");

const config = require("../config.json").services.state;
const queue = require("../lib/lib.queue.js");
const log = require("../lib/lib.logger.js")("STATE");

// connect
queue.connect();


// connections
var connections = [];


// create server & listen for messages
let server = net.createServer(function (socket) {

	// set encoding
	socket.setEncoding("utf8");
    connections.push(socket);
    
    
    socket.on("close", function(){
      connections.splice (connections.indexOf(socket), 1)
    });
    

	// listen for incoming data
	socket.on("data", function (data) {
		try {

			// parse message
			let json = new Buffer(data, "base64").toString("utf8");
			let obj = JSON.parse(json);

			// feedback
			log.debug("Set state for computer %s to %s", socket.remoteAddress, obj.state);


			queue.update({
				ip: socket.remoteAddress
			}, {
				state: obj.state
			});


		} catch (err) {

			// debug
			console.log("Could not parse state message", err);

		} finally {

			// close socket
			socket.destroy();

		}
	});


});


server.on("error", function (err) {

	// feedback
	log.error(err, "Could not start: %s", err.message);

});


// listen when server is started
// feedback for better usability
server.on("listening", function () {

	let address = this.address();
	log.info("Server listening on %s:%s", address.address, address.port);

});


// fire up
server.listen(config.port, config.host);  



process.on("message", function(event){
  if(event === "shutdown"){
    
    // feedback
    log.trace("Graceful shutdown...");
            
    // close server
    server.close(function(){
      
      log.info("Server closed");
      process.exit(0);      
      
    });    
    
    // close sockets
    connections.forEach(function(socket){
      socket.destroy();
    });    
    
  }
});