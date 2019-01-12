const path = require("path");
const bunyan = require("bunyan");
const chalk = require("chalk");
const df = require("dateformat");

const config = require("../config.json").logger;

module.exports = function (name) {

  function Format() {
    this.colors = {
      10: { color: chalk.cyan, name: "TRACE" },
      20: { color: chalk.gray, name: "DEBUG" },
      30: { color: chalk.blue, name: "INFO" },
      40: { color: chalk.yellow, name: "WARN" },
      50: { color: chalk.red, name: "ERROR" },
      60: { color: chalk.bgRed, name: "FATAL" }
    };
  }

  Format.prototype.write = function (rec) {

    let obj = JSON.parse(rec);
    let level = this.colors[obj.level];


    let color = level.color;
    let name = level.name;
    let time = df(rec.time, config.time || "yyyy.mm.dd - HH.MM.ss.l");

    // format & write to process.stdout
    console.log("[%s][%s][%s] %s", color(time), color(obj.name), color(name), obj.msg);

  };


  // create new logger
  let logger = bunyan.createLogger({
    name: name,
    level: config.level || "trace",
    streams: [{
      name: "shell",
      stream: (new Format())
    }, {
      //type: 'rotating-file',
      path: path.resolve(__dirname, "../", config.path, "app.log"),
      //period: '1d', // daily rotation
      //count: 3        // keep 3 back copies				
    }]
  });


  logger.on("error", function (err) {
    console.log("ERR", err);
  });


  /**
   * Create child logger
   * @param {type} name
   * @returns {undefined}
   */
  logger.create = function (name) {
    return logger.child({ component: name });
  };

  // return logger
  return logger;

};