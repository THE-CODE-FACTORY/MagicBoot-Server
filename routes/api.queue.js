const express = require("express");


module.exports = function (log, app) {

  // <host>/api/images
  // shortcut to model & router
  router = express.Router();
  //let model = app.db.model("Tasks");


  router.put("/", function (req, res) {

    console.log("api.queue.js - put: body >> ", req.body);

    app.queue.add(req.body);

    res.json(app.queue.computer);


  });

  /*
    router.get("/:id?", function (req, res) {
  
      if (req.params && req.params.id) {
  
        // find computer by ip
        let result = app.queue.find({
          _id: req.params.id
        });
  
        if (!result) {
          return res.statu(404).end();
        }
  
        // return wanted computer
        return res.json(result);
  
      }
  
      // return whole queue
      res.json(app.queue.computer);
  
    });
    */


  router.delete("/:id", function (req, res) {

    let computer = app.queue.find({
      _id: req.params.id
    });

    if (!computer) {
      return res.status(404).end();
    }

    let success = app.queue.remove({
      mac: computer.mac
    });

    if (success) {

      // return updated queue
      //app.queue.emit("dhcp.remove", mac);
      app.queue.emit("ftpt.abort", computer.ip);
      res.json(app.queue.computer);

    } else {

      // could not manipulate queue.computer array
      res.status(500).json({
        error: "Could not delete computer " + req.params.id
      });

    }

  });


  // export router
  return router;

};