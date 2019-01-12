const path = require("path");
const express = require("express");
const log = require("../lib/lib.logger.js")("WEB");

module.exports = function(app){
  
  //require("./router.files.js")(log.create("FILES"), app);
  //require("./router.old.js")(log, app);
  require("./router.api.js")(log.create("API"), app);
  //require("./router.files.js")(log, app);  
  //require("./router.webdav.js")(log.create("WEBDAV"), app);
  
  // serve index.html
  app.get("/", function (req, res) {
    res.sendFile("index.html", {
			root: path.resolve(__dirname, "../public")
		});
  });  
  
  app.all(function(req, res){
    log.debug("Unhandled request: %s", req.url);
    res.status(307).redirect("/");
  });
  
};