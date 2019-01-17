const express = require("express");
const merge = require("merge-anything");

module.exports = function (log, app) {

    // <host>/api/images
    // shortcut to model & router
    const router = express.Router();

    app.db.connection.on("open", function () {

        var admin = new app.db.mongo.Admin(app.db.connection.db);

        console.log(admin.serverStatus(function (err, info) {
            console.log(err, info);
        }));

        admin.buildInfo(function (err, info) {
            console.log(info);
        });
    });



    router.get("/", function (req, res) {

        //console.log(mongo.hostInfo());


    });


    // export router
    return router;

};