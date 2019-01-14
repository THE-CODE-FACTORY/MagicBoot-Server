const merge = require("merge");
const express = require("express");


module.exports = function (log, app) {

    // <host>/api/update
    // shortcut router
    router = express.Router();


    router.get("/check", function (req, res) {
        log.trace("adsfasdfasdfasdfasdf");
        app.queue.emit("updater.check");
    });

    router.get("/load", function (req, res) {
        app.queue.emit("updater.load");
    });

    router.get("/install", function (req, res) {
        app.queue.emit("updater.install");
    });

    // export router
    return router;

};