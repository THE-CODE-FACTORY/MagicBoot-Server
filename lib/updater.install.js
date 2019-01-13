const path = require("path");
const fs = require("fs");



module.exports = function (log, queue) {
    return function (folder, cb) {

        try {

            const sr = fs.statSync(path.join(folder, "checksum.json"));
            const sl = fs.statSync(path.join(__dirname, "../checksum.json"));

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

                //log.trace("File: %s", file);
                //log.trace("Remote: %s\nLocal: %s", sr[file], sl[file]);

                if (sr[file] === sl[file]) {

                    // feedback
                    log.trace("%s, nothing to do...", file);

                } else {

                    updateFiles.push(file)

                }

            } else {

                updateFiles.push(file);

            }
        }

        var counter = updateFiles.length;
        updateFiles.forEach((files) => {

            const src = path.join(folder, sr[file]);
            const dest = path.join(__dirname, "../", sr[file]);

            // feedback
            log.debug("Override %s to %s", src, dest);

            // override old file with new
            fs.copyFile(src, dest, function (err) {
                if (err) {

                    log.warn(err, "Could not copy update file %s");
                    log.error(err, "Update incomplete!");

                } else {

                    counter--;

                    if (counter === 0) {

                        // feedback
                        log.info("Updated %s files", updateFiles.length);

                    }

                }
            });
        });

    };
}