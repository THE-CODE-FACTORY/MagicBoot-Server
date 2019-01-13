const config = require("../config.json");
const cfg = config.services.updater;
const log = require("../lib/lib.logger.js")("UPDATER");
const queue = require("../lib/lib.queue.js");
const path = require("path");
const fs = require("fs");

// connect to server
queue.connect();

var remotePath = "";


const check = require("../lib/updater.check.js")(log.create("check"), queue);
const install = require("../lib/updater.install.js")(log.create("install"), queue);
const load = require("../lib/updater.load.js")(log.create("load"), queue);
const checksum = require("../lib/updater.checksum.js")(log.create("checksum"), queue);



fs.stat(path.join(__dirname, "../checksum.json"), function (err) {

    if (err) {

        if (err.code !== "ENOENT") {

            log.warn(err, "Could not read checksum.json");

        } else {

            // feedback
            log.debug("Create checksum.json for local installation");

            checksum(path.join(__dirname, "../"), function (err) {
                if (err) {

                    log.warn("Could not create checksum.json for local installation");

                } else {

                    log.debug("Created checksum.json for local installation");

                }
            });

        }

        return;

    }

    if (Date.now() - stat.mdate >= 86400000) {

        // feedback
        log.debug("Create checksum.json for local installation");

        checksum(path.join(__dirname, "../"), function (err) {
            if (err) {

                log.warn("Could not create checksum.json for local installation");

            } else {

                log.debug("Created checksum.json for local installation");

            }
        });

    }

});


queue.on("updater.check", function () {

    // set timestamp
    cfg.lastCheck = Date.now();

    // wirte to config.json
    fs.writeFile(path.join(__dirname, "../config.json"), JSON.stringify(config, null, 2), function (err) {

        if (err) {
            return log.warn(err, "Could not update 'lastCheck' timestamp");
        }

        // feedback
        log.trace("Updated 'lastCheck' timestamp to %d", cfg.lastCheck);

        // check for updates
        check(function (available) {
            if (available) {

                console.log("update avb")

            } else {

                console.log("no update");

            }
        });


    });

});


queue.on("updater.load", function () {
    load(function (err, root) {
        if (err) {

            log.error("Could not download update");

        } else {

            log.debug("Created checksum.json for update files in %s", root);

            checksum(root, function (err) {
                if (err) {

                    log.warn(err, "Could not create checksum.json for remote");

                } else {

                    // read for installation
                    log.debug("Ready for installation");
                    remotePath = root;

                }
            });

        }
    });
});



queue.on("updater.install", function () {
    if (updatePath = "") {

        log.error("Update not ready for instllation");

    } else {

        console.log("----- INSTALL !!! COPY!!!");
        console.log("Dry run! uncomment, l:148");

        return;

        install(updatePath, function (err) {

            console.log(err, "Update install cb")

        });

    }
});


setInterval(function () {
    if ((Date.now() - cfg.lastCheck >= cfg.interval)) {

        log.debug("Check for updates...");
        queue.emit("updater.check");

    }
}, 1000 * 60 * 60);


// emitted from http api ?!?
//queue.emit("updater.check");
//queue.emit("updater.load");