const net = require("net");
const merge = require("merge-anything");
const log = require("./lib.logger.js")("QUEUE");
const jot = require('json-over-tcp');


function Queue() {

  this.connections = [];
  this.computer = [];
  this.port = 6512;
  this.socket = null;
  this.s = null;

}


/**
 * Create a new TCP Server
 * Clients connect over the loopback interface here.
 * We can broadcast events over multiple processes.
 * @returns {undefined}
 */
Queue.prototype.server = function server() {

  let that = this;
  let server = jot.createServer();
  this.s = server;

  server.on("connection", function (socket) {

    // setup socket
    // save connection for broadcast
    //socket.setKeepAlive(true);
    //socket.setEncoding("utf8");
    that.connections.push(socket);


    // broadcast from client to other clients
    socket.on("data", function (data) {
      that.connections.forEach(function (connection) {

        // @FIXME check if connection exists
        // -> socket error
        // -> connection.connected or so...

        // broadcast to all 
        // connected clients
        connection.write(data);

      });
    });


    // wait for client disconnect
    // remove connection from array
    socket.on("disconnect", function () {

      console.log("Disconnected");

      let index = that.connections.indexOf(socket);
      that.connections.splice(index, 1);

    });


    // handle error events
    // socket hang up or closed 
    socket.on("error", function (err) {
      //if (err.code) {
      if (err.code === "EPIPE" || "ECONNRESET") {

        let index = that.connections.indexOf(socket);
        that.connections.splice(index, 1);

      } else {

        console.log(">> Socket error", err);

      }
      //} else {

      //        console.log("--------------", err);

      //}
    });

  });


  // close all client connections
  // so we cant send messages to them anymore
  server.on("close", function () {
    that.connections.forEach(function (connection) {

      // destroy/close clients
      connection.destroy();

    });
  });

  // fire server up
  server.listen(that.port, "127.0.0.1");

};


/**
 * Connect to a Queue Server
 * use the loopback interface
 * @param {function} cb Called when connect event is fired
 * @returns {undefined}
 */
Queue.prototype.connect = function connect(cb) {

  let that = this;

  // create socket & connect
  //this.socket = net.Socket();
  //this.socket.setEncoding("utf8");
  //this.socket.connect(this.port, "127.0.0.1");
  this.socket = jot.connect(this.port, "127.0.0.1");

  this.socket.on("connect", function () {

    // feedback
    log.trace("Connection from %d", process.pid);

    //@FIXME Ignore update from our self
    that.on("update", function (data) {
      log.trace("Update queue in process: ", process.pid);
      that.computer = data;
    });

    //console.log("asdfasdf");

    if (cb) {
      cb();
    }

  });

  // cleanup
  this.socket.on("error", function (err) {
    console.log("in connect", err);
  });

};


/**
 * Listen on events from server
 * @param {string} event
 * @param {function} cb
 * @returns {undefined}
 */
Queue.prototype.on = function (event, cb) {

  if (this.socket) {

    this.socket.on("data", function (data) {

      //if (data.pid !== process.pid) {

      // the event we want ?
      if (data.event === event) {
        cb.apply(data, data.args);
      }

      //}


    });

  } else {





    const that = this;

    this.s.on("connection", function (socket) {
      socket.on("data", function (data) {

        if (data.event === event) {
          cb.apply(data, data.args);
        }

      });
    });


  }

};


/**
 * Emit events, over server to other clients
 * @returns {undefined}
 */
Queue.prototype.emit = function () {

  let args = Array.prototype.slice.call(arguments);
  let event = args.shift();

  // format json message
  let data = {
    event: event,
    args: args,
    origin: process.pid
  };

  if (this.socket) {

    // check if we can write to socket
    if (this.socket.destroyed) {
      return;
    }

    // send to server
    this.socket.write(data, "utf8");

  } else {

    // broadcast to other clients
    this.connections.forEach(function (socket, index) {
      //if (socket) {

      if (socket.destroyed) {
        this.connections.splice(index, 1);
        return;
      }

      // write data to socket
      socket.write(data, "utf8");

      //}
    }, this);

  }

};


/**
 * Find computer in queue
 * @param {object} find
 * @param {string} find.mac MAC Address from Computer
 * @param {string} find.ip IP Address from Computer
 * @returns {unresolved}
 */
Queue.prototype.find = function (find) {

  let that = this;
  let target = undefined;

  for (let i = 0; i < that.computer.length; i++) {

    let found = true;

    for (let k in that.computer[i]) {
      if (find[k] && find[k] !== that.computer[i][k]) {

        found = false;
        break;

      }
    }

    if (found) {

      target = that.computer[i];
      break;

    }

  }


  return target;

};


/**
 * Add a Object to computer queue
 * Update other queues over server via build in update() call
 * @param {type} obj
 * @returns {undefined}
 */
Queue.prototype.add = function (obj) {
  this.computer.push(obj);
  this.update();
};


/**
 * Remove a Object from queue
 * Update other queues via build in update() call
 * @param {object} find
 * @param {string} find.mac MAC Address from computer
 * @param {string} find.ip IP Address from Computer
 * @returns {Boolean}
 */
Queue.prototype.remove = function (find) {

  // find computer in queue
  let computer = this.find(find);

  if (!computer) {
    return false;
  }

  // get index from computer object & splice array
  let index = this.computer.indexOf(computer);
  this.computer.splice(index, 1);

  // success
  this.update();
  return true;

};


/**
 * Update a Computer in queue
 * Broadcast new queue to all processes
 * @param {type} find
 * @param {type} data
 * @param {boolean} emit Broadcast
 * @returns {Boolean}
 */
Queue.prototype.update = function (find, data, noEmit = false) {

  if (!find || !data) {
    this.emit("update", this.computer);
    return false;
  }

  // find computer in queue
  let computer = this.find(find);
  let index = this.computer.indexOf(computer);

  if (!computer) {
    return false;
  }
  /*
    console.log(); console.log();
    console.log(); console.log();
    console.log("NEW DATA", data);
    console.log(); console.log();
    console.log(); console.log();
  */
  //console.log("in update", computer);
  //console.log(); console.log();
  //console.log("pre merge", computer);

  // merge computer with data
  computer = merge(computer, data);

  /*
    console.log();
    console.log();
    console.log("after merged", computer);
  */


  this.computer.splice(index, 1, computer);



  // update other clients
  if (!noEmit) {
    this.emit("update", this.computer);
  }

  return true;

};

// return new instance
module.exports = new Queue();