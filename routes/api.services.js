const merge = require("merge");
const express = require("express");


module.exports = function (log, app) {

    // <host>/api/update
    // shortcut router
    router = express.Router();


    router.get("/:name/start", function (req, res) {

        if (!req.params.name) {
            return res.status(404);
        }

        app.queue.once("service.started", function () {

            log.trace("Service '%s' started", req.params.name);
            res.json({ success: true });

        });

        app.queue.emit("service.start", req.params.name);

    });


    router.get("/:name/stop", function (req, res) {

        if (!req.params.name) {
            return res.status(404);
        }

        app.queue.on("service.stopped", function () {

            log.trace("Service '%s' stopped", req.params.name);
            res.json({ success: true });

        });

        app.queue.emit("service.stop", req.params.name);

    });


    router.get("/:name/restart", function (req, res) {

        if (!req.params.name) {
            return res.status(404);
        }

        app.queue.once("service.restarted", function () {

            log.trace("Service '%s' restarted", req.params.name);
            res.json({ success: true });

        });

        app.queue.emit("service.restart", req.params.name);

    });

    // export router
    return router;

};