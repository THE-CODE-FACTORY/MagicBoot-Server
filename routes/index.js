const path = require("path");
const express = require("express");
const log = require("../lib/lib.logger.js")("WEB");
const si = require("systeminformation");
const config = require("../config.json").network;

module.exports = function (app) {

  const ns = app.io.of("/admin");

  ns.on("connection", function (socket) {

    log.debug("Admin connected");


    app.queue.on("queue", function (data) {
      socket.emit("queue", data);
    });

    socket.on("queue", function (data, cb) {
      cb(app.queue.computer);
    });

  });


  (function () {

    var stats = {};

    setInterval(function () {

      si.currentLoad(data => {
        stats["cpu"] = Math.round(data.currentload);
      });

      si.mem(data => {
        stats["mem"] = Math.round((data.used / data.total) * 100);
      });

      si.fsStats(data => {
        // / si.disksIO
        //stats["hdd"] = data;
      });

      si.networkStats(config.interface, data => {
        stats["net"] = data.tx_sec;
      });

      ns.emit("resources", stats);

    }, 1500);

  });



  //require("./router.files.js")(log.create("FILES"), app);
  //require("./router.old.js")(log, app);
  require("./router.api.js")(log.create("API"), app);
  //require("./router.files.js")(log, app);  
  //require("./router.webdav.js")(log.create("WEBDAV"), app);

  /*
  app.use(function (req, res, next) {
  
    if (req.url[req.url.length - 1] !== "/") {
      res.redirect(req.url + "/");
    }
  
    next();
  
  });*/

  // serve index.html
  app.get("/", function (req, res) {
    res.sendFile("index.html", {
      root: path.resolve(__dirname, "../public")
    });
  });

  app.get("/admin", function (req, res) {
    res.sendFile("admin.html", {
      root: path.resolve(__dirname, "../public")
    });
  });

  app.all(function (req, res) {
    log.debug("Unhandled request: %s", req.url);
    res.status(307).redirect("/");
  });

};