const path = require("path");
const fs = require("fs");



module.exports = function (log, queue) {
    return function (folder, cb) {

        console.log("update location", folder);

        var sr, sl;

        try {

            sr = require(path.resolve(folder, "checksum.json"));
            sl = require(path.resolve(__dirname, "../checksum.json"));

        } catch (err) {

            return log.warn(err, "Could not read checksum.json, local/remote");

        }


        var updateFiles = [];

        // über remote array iterate
        // check ob file in local array
        // -> nein: copy from remote
        // -> ja: compare md5

        for (file in sr) {
            if (sl[file]) {

                //console.log("File: %s", file);
                //log.trace("Remote: %s", sr[file]);
                //log.trace("Local: %s", sl[file]);
                //console.log();

                if (sr[file] === sl[file]) {

                    // feedback
                    //log.trace("%s, nothing to do...", file);

                } else {

                    updateFiles.push(file)

                }

            } else {

                updateFiles.push(file);

            }
        }


        try {

            var counter = updateFiles.length;
            updateFiles.forEach((file) => {

                const src = path.join(folder, file);
                const dest = path.join(__dirname, "../", file);

                // feedback
                log.trace("Override %s to %s", src, dest);

                // override old file with new
                fs.copyFile(src, dest, function (err) {
                    if (err) {

                        log.warn(err, "Could not copy update file %s");
                        log.error(err, "Update incomplete!");
                        throw err;

                    } else {

                        counter--;

                        if (counter === 0) {

                            // feedback
                            log.info("Updated %s files", updateFiles.length);
                            cb();

                        }

                    }
                });
            });

        } catch (err) {
            cb(err);
        }

    };
}