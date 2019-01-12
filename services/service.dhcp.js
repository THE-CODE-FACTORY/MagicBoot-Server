const merge = require("merge");
const dhcp = require("dhcp");
const db = require("../lib/lib.database.js");
const queue = require("../lib/lib.queue.js");
const config = require("../config.json").services.dhcp;
const log = require("../lib/lib.logger.js")("DHCP");


// connect to server
queue.connect();


/**
 * Helper for group/tasks nesting
 * @param {*} arr 
 * @param {*} key 
 */
const flatten = function flatten(arr, key) {
  return arr.reduce(function (acc, val) {

    // val[key] = val.task/val.groups/val....
    if (Array.isArray(val[key])) {

      return acc.concat(flatten(val[key]));

    } else {

      return acc.concat(val); //val.tasks


    }

  }, []);
};

/*
var diagnostic = [];

queue.on("queue.diagnostic", function (data) {

  console.log("put computer %s in diagnotist array", data.mac);
  diagnostic.push(data.mac);

});
*/


// merge options
let options = merge({
  range: ["172.16.0.100", "172.16.0.200"],
  netmask: "255.255.255.0",
  router: ["172.16.0.254"],
  dns: ["9.9.9.9", "8.8.8.8", "8.8.4.4"],
  broadcast: "172.16.0.255",
  server: "172.16.0.1",
  leaseTime: 86400,
  randomIP: false,
  forceOptions: ["hostname"],
  hostname: "server",
  domainName: "magic-boot.lan",
  bootFile: "pxelinux.0"
}, config.options);


// create dhcp server
let server = dhcp.createServer(options);
//log.trace("Start server with options", options);


server._sock.on("error", function (err) {
  if (err.code === "EACCES") {

    log.error(err, "Could not start because of insufficient rights, (sudo?)");

  } else {

    log.error(err, "Could not start Server");

  }
});


server.on("error", function (err) {
  log.trace(err, "DHCP Server...");
});


// listen when server is started
// feedback for better usability
server.on("listening", function (socket) {

  let address = socket.address();
  log.info("Server listening on %s:%s", address.address, address.port);

});


// listen for ip address bound events
// update computer info with acceptet ip
// offer != bound, thats why we keep it as extra step
server.on('bound', function (data) {

  //log.trace("BOUND:", data);
  let update = false;

  // iterate over data
  for (let mac in data) {

    // format mac address
    let client = data[mac];
    mac = mac.replace(/-/g, ':');
    let pc = queue.find({ mac: mac });

    if (client.state === "BOUND") {
      log.debug("IP %s assigned to %s", client.address, mac);
    }

    // check state & computer is has no ip
    // and is queue for deployment
    if (client.state === "BOUND" && pc && pc.ip === null) {

      // update computer
      update = true;
      queue.update({
        mac: mac
      }, {
          ip: client.address
        },
        false);

    }

  }

  if (update) {

    // broadcast only by changes 
    log.trace("IP Address/computer binding updated");
    queue.update();

  }

});


// liste for dhcp messages
// check if client request pxe options
// featch db for computer info
server.on("message", function (data) {
  if (data.options[55]) {

    // 67 = Bootfile name
    // 66 = TFTP server
    // 129 - 135 PXE vendor specific (syslinux)
    //const need = [67, 66, 129, 130, 131, 132, 133, 134, 135];
    const need = [67, 129, 130, 131, 132, 133, 134, 135];


    // check if options match
    let pxeClient = (function () {

      // init stuff
      let is = true;

      for (let i = 0; need.length > i; i++) {
        if (data.options[55].indexOf(need[i]) === -1) {

          is = false;
          break;

        }
      }

      // return
      return is;

    })();


    // format mac address
    let mac = data.chaddr.replace(/-/g, ':');
    mac = mac.toUpperCase();


    // fetch data from db
    // merge with template
    if (pxeClient && !queue.find({ mac: mac })) {

      // build query
      let query = db.model("Computer").findOne({
        mac: mac
      });


      // populate
      query.populate([{
        path: "tasks"
      }, {
        path: "image"
      }, {
        path: "groups",
        populate: [{
          path: "tasks"
        }]
      }]);


      // execute query
      query.lean();
      query.exec(function (err, data) {

        if (err) {
          return log.error(err, "Could not query database");
        }

        if (data) {

          // flatt task array & 
          // concat with computer specific tasks
          var tasks = flatten(data.groups, "tasks");
          tasks = tasks.concat(data.tasks);

          //console.log(tasks)




          // basic template
          // merge with database
          let computer = {
            name: "<unknown>",
            mac: mac,
            ip: null,
            state: "pending",
            progress: {
              value: 0
            },
            client: {
              connected: false,
              //task: 0,
              tasks: tasks
            }
          };


          /*
                    if (diagnostic.indexOf(mac) !== -1) {
                      log.trace("Set computer %s to diagnostic state", computer.name);
                      computer.state = "diagnostic";
                    }
                    */

          // merge db with template
          merge(computer, data);
          //console.log("COMPUTER IN DHCP", computer.client.tasks);


          // fedback
          log.info("Computer '%s' discoverd", computer.name);

          // add to queue
          queue.add(computer);

        } else {

          // feedback
          // ignorieren -> ermöglicht anderen clients UI zugriff
          // fehler nach filehandler verschieben ?
          // dürfte von "normalen" computer nicht erreicht werden
          // da diese keine PXE optionen anfragen....
          log.info("Unregistered computer discoverd (PXE boot), ", mac);

        }

      });
    }
  }
});

// fire up
server.listen(config.port, config.host);



/*
// needed?!
// wenn bleibt, dann bekommt pc immer selbe ip... -> kein IP konflikt
queue.on("dhcp.remove", function (mac) {

  console.log("Remove IP from pool", ip, server);

});
*/



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

  }
});



