const express = require("express");
const merge = require("merge-anything");
const si = require("systeminformation");

module.exports = function (log, app) {

    // <host>/api/images
    // shortcut to model & router
    const router = express.Router();

    /*
    app.db.connection.on("open", function () {

        var admin = new app.db.mongo.Admin(app.db.connection.db);

        console.log(admin.serverStatus(function (err, info) {
            console.log(err, info);
        }));

        admin.buildInfo(function (err, info) {
            console.log(info);
        });
    });
*/


    router.get("/", function (req, res) {

        var data = {};

        si.networkInterfaces(list => {

            data.network = {
                interfaces: list
            }

            res.json(data)

        });


    });


    // export router
    return router;

};