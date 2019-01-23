const express = require("express");
const fs = require("fs");
const path = require("path");
const readline = require('readline');

module.exports = function (log, app) {

    // <host>/api/images
    // shortcut to model & router
    router = express.Router();

    router.get("/", function (req, res) {

        if (req.query.start && req.query.end) {

        }

        var lines = [];

        const stream = fs.createReadStream(path.resolve(__dirname, "../log/app.log"));

        stream.once("error", (err) => {
            if (err) {

                res.status(500).json({
                    error: err.message
                });

            } else {

                console.log(">>", err);

            }
        });



        var rd = readline.createInterface({
            input: stream,
            //output: process.stdout,
            console: false
        });

        rd.on('line', function (line) {

            lines.push(JSON.parse(line));

        });

        rd.on("close", function () {

            console.log("Stream closed");
            res.json(lines);

        });


    });


    router.get("/clear", function (req, res) {

        fs.unlink(path.resolve(__dirname, "../log/app.log"), (err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true
            });

        });

    });


    router.get("/save", function (req, res) {

        res.setHeader('Content-disposition', 'attachment; filename=MagicBoot-Server.log');
        res.setHeader('Content-type', "text");

        var filestream = fs.createReadStream(path.resolve(__dirname, "../log/app.log"));
        filestream.pipe(res);

    });


    return router;

};