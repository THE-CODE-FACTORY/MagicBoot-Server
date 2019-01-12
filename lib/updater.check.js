const lib = require("./lib.http.js");
const url = require("url");
const semver = require("semver");
const pkg = require("../package.json");
var uri = new url.URL(pkg.repository);

module.exports = function (log, queue) {


    lib.get(`https://raw.githubusercontent.com${uri.pathname.replace(".git", "")}/master/package.json`, (res, red) => {

        var content = "";

        if (red) {
            res = red;
        }

        res.on("data", (chunk) => {
            content += chunk;
        });

        res.on("end", () => {

            // feedback
            log.trace("remote package.json loaded");

            try {

                content = JSON.parse(content);
                if (semver.gt(content.version, pkg.version)) {

                    // update avalaible
                    log.info("Update available, %s -> %s", pkg.version, content.version);

                } else {

                    // no update, we use the actual version
                    log.debug("We use the actual version");

                }

            } catch (err) {

                log.warn(err, "Could not parse remote package.json");

            }

        });

    });


}