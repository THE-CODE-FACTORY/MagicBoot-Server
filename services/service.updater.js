const config = require("../config.json");
const cfg = config.services.updater;
const log = require("../lib/lib.logger.js")("UPDATER");
const queue = require("../lib/lib.queue.js");
const path = require("path");
const fs = require("fs");

// connect to server
queue.connect();

var updateLocation = "";


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

    /*
    if (Date.now() - cfg.lastCheck >= cfg.interval * 1000 * 60 * 60) {

        // feedback
        log.debug("Create checksum.json for local installation");

        checksum(path.join(__dirname, "../"), function (err) {
            if (err) {

                log.warn("Could not create checksum.json for local installation");

            } else {

                log.debug("Created checksum.json for local installation");

            }
        });

    }*/

});


queue.on("updater.check", function () {

    // set timestamp
    cfg.lastCheck = Date.now();

    // check for updates in remote package.json
    check(function (available) {
        fs.writeFile(path.join(__dirname, "../config.json"), JSON.stringify(config, null, 2), function (err) {

            if (err) {
                log.warn(err, "Could not update 'lastCheck' timestamp");
            }

            if (available) {

                console.log("update avb")
                //queue.emit("updater.load");
                // create checksum.json ?!
                // besser als in fs.stat....

            } else {

                console.log("no update");

            }

        });
    });

});


queue.on("updater.load", function () {
    load(function (err, location) {
        if (err) {

            log.error("Could not download update");

        } else {

            log.info("Update downloaded");
            log.debug("Created checksum.json for update files in %s", location);

            checksum(location, function (err) {
                if (err) {

                    log.warn(err, "Could not create checksum.json for remote");

                } else {

                    // feedback
                    log.debug("Ready for installation");

                    //queue.emit("updater.install");
                    updateLocation = location;

                }
            });

        }
    });
});



queue.on("updater.install", function () {
    if (updateLocation === "") {

        log.error("Update not ready for instllation");

    } else {

        console.log("----- INSTALL !!! COPY!!!");
        console.log("Dry run! uncomment, l:148");
        return;

        install(updateLocation, function (err) {

            console.log(err, "Update install cb")

        });

    }
});



setInterval(function () {
    if ((Date.now() - cfg.lastCheck >= (cfg.interval * 1000 * 60 * 60))) {

        log.debug("Check for updates..., last checked:", cfg.lastCheck);
        queue.emit("updater.check");

    }
}, 1000 * 60 * 60);


// emitted from http api ?!?
//queue.emit("updater.check");
//queue.emit("updater.load");