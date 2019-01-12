const config = require("../config.json").services.dhcp;
const log = require("../lib/lib.logger.js")("UPDATER");
const queue = require("../lib/lib.queue.js");

// connect to server
queue.connect();

