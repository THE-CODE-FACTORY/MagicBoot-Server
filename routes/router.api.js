const express = require("express");
const bodyParser = require("body-parser");



module.exports = function (log, app) {

  // create api router
  // mount json middleware
  let router = express.Router();
  router.use(bodyParser.json());
  app.use("/api", router);


  // require handler
  router.use("/computer", require("./api.computer.js")(log, app));
  router.use("/images", require("./api.images.js")(log, app));
  router.use("/tasks", require("./api.tasks.js")(log, app));
  router.use("/groups", require("./api.groups.js")(log, app));
  router.use("/settings", require("./api.settings.js")(log, app));
  router.use("/queue", require("./api.queue.js")(log, app));
  router.use("/update", require("./api.update.js")(log, app));


  // feedback
  router.get("/", function (req, res) {
    res.json({
      data: "Welcome to the API"
    });
  });


};