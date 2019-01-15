const express = require("express");
const fs = require("fs");
const path = require("path");

const readline = require('readline');


module.exports = function (log, app) {

    // <host>/api/images
    // shortcut to model & router
    router = express.Router();

    router.get("/", function (req, res) {

        const stream = fs.createReadStream(path.resolve(__dirname, "../log/app.log"));

        stream.once("error", (err) => {
            console.log(">>", err);
        });





        var rd = readline.createInterface({
            input: stream,
            //output: process.stdout,
            console: false
        });

        rd.on('line', function (line) {
            res.write(line)
        });


    });




    return router;

};