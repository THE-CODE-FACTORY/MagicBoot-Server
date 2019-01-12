const lib = require("./lib.http.js");
const semver = require("semver");
const pkg = require("../package.json");


lib.get("https://raw.githubusercontent.com/mStirner/node-dmx-client/master/package.json", (res, red) => {

    var content = "";

    if (red) {
        res = red;
    }

    res.on("data", (chunk) => {
        content += chunk;
    });

    res.on("end", () => {

        console.log("package.json loaded");

        try {

            content = JSON.parse(content);

            if (semver.gt(content.version, pkg.version)) {

                // update avalaible
                console.log("Update available, %s -> %s", pkg.version, content.version);

            } else {

                // no update, we use the actual version
                console.log("We use the actual version");

            }

        } catch (err) {

            console.log("Could not parse remote package.json", err);

        }

    });

});