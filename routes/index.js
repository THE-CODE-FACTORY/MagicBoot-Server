const path = require("path");
const express = require("express");
const log = require("../lib/lib.logger.js")("WEB");
const si = require("systeminformation");

module.exports = function (app) {

  const ns = app.io.of("/admin");

  ns.on("connection", function () {

    log.debug("Admin connected");

  });


  (function () {

    var stats = {};

    setInterval(function () {

      si.mem(data => {
        stats["mem"] = (data.total / data.free * 100);
      });

      si.fsStats(data => {
        // / si.disksIO
        //stats["hdd"] = data;
      });

      si.networkStats(data => {
        //stats["net"] = data;
      });

      ns.emit("resources", stats);

    }, 1500);

  })();



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