const merge = require("merge");
const express = require("express");


module.exports = function (log, app) {

  // <host>/api/images
  // shortcut to model & router
  router = express.Router();
  let model = app.db.model("Images");


  router.get("/:id?", function (req, res) {

    // mongoose cb handler
    let handle = function (err, data) {

      if (err) {
        log.warn(err, "Could not fetch data from db");
        return res.status(500).json({
          error: err
        });
      }
      
      if(!data){
        return res.status(404).end();
      }      

      // success
      res.json(data);

    };

    if (req.params.id) {
      model.findOne({_id: req.params.id}, handle);
    } else {
      model.find({}, handle);
    }

  });


  router.put("/", function (req, res) {
    (new model(req.body)).save(function (err, data) {

      if (err) {
        log.warn(err, "Could not add image");
        return res.status(500).json({
          error: err
        });
      }

      // success
      res.json(data);

    });
  });


  router.post("/:id", function (req, res) {
    model.findOne({_id: req.params.id}, function (err, doc) {

      if (err) {
        log.warn(err, "Could not fetch data image %s", req.params.id);
        return res.status(500).json({
          error: err
        });
      }

      if (!doc) {
        return res.status(404).end();
      }

   
      merge(doc, req.body);

      doc.save({
        new : true,
        //lean: true
      }, function (err, data) {

        if (err) {

          if (err.name && err.name === "ValidationError") {

            // invalid input (missing something)
            return res.status(400).json({
              error: err.message
            });

          } else if (err.code && err.code === (11000 || 11001)) {

            // computer exists
            return res.status(400).json({
              error: "Name or allready exists"
            });

          }

          log.warn(err, "Could not update doc");

          return res.status(500).json({
            error: err
          });

        }

        // success
        res.json(data);

      });


    });
  });


  router.delete("/:id", function (req, res) {
    model.findOne({_id: req.params.id}, function (err, doc) {

      if (err) {
        log.warn(err, "Could not delete image %s", req.params.id);
        return res.status(500).json({
          error: err
        });
      }
      
      if(!doc){
        return res.status(404).end();
      }      

      // remove document
      doc.remove(function (err, result) {

        if (err) {
          log.warn(err, "Could not delete image %s", req.params.id);
          return res.status(500).json({
            error: err
          });
        }

        console.log("DELETE IMAGES --> api.images.js", result);

        // success
        res.json({
          success: true,
          data: result
        });

      });

    });
  });


  // export router
  return router;

};