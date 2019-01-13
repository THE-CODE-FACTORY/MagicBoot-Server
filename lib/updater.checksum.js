// https://gist.github.com/kethinov/6658166



const path = require("path");
const fs = require('fs').promises;
const fsp = require('fs');
const crypto = require('crypto');
const start = new Date().getTime();


/**
 * Create file tree, relative to the <loc> path
 * @param {string} loc path to folder
 * @param {arry} ignore file/folder to be ignored, relative to <loc>
 */
const tree = async (loc, ignore = []) => {


    const walk = async (dir, filelist = []) => {

        const files = await fs.readdir(dir);

        for (file of files) {

            const filepath = path.join(dir, file);
            const stat = await fs.stat(filepath);

            if (stat.isDirectory()) {

                const folder = path.dirname(filepath).split(path.sep).pop()

                if (ignore.indexOf(folder) === -1) {
                    filelist = await walk(filepath, filelist);
                } else {
                    return filelist;
                }

            } else {

                const index = filepath.replace(loc + "/", "");

                if (ignore.indexOf(index) === -1) {
                    filelist.push(index);
                }

            }

        }

        return filelist;

    }

    return await walk(loc);

};




module.exports = function (log, queue) {


    const ignore = [
        ".git",
        "node_modules",
        "log",
        "CHECK",
        "config.json",
        "package-lock.json",
        "checksum.json"
    ];

    return function (root, cb) {
        tree(root, ignore).then((files) => {

            log.debug("Create cheksum.json for root: %s", root);

            var checksum = {};
            var counter = files.length;

            try {
                files.forEach((file) => {


                    fsp.readFile(path.resolve(root, file), {
                        encoding: "utf8"
                    }, function (err, content) {

                        if (err) {
                            throw err;
                        }

                        if (!content) {
                            throw new Error('Ignore file `${file}`, no content');
                        }


                        // create chceksum for file
                        const hash = crypto.createHash('md5');
                        checksum[file] = hash.update(content).digest('hex');
                        counter--;


                        if (counter === 0) {

                            const end = new Date().getTime();


                            log.info("Calculated in %dms, (%d, files)", end - start, files.length);

                            fsp.writeFile(path.resolve(root, "checksum.json"), JSON.stringify(checksum, null, 2), function (err) {

                                if (err) {
                                    return log.error(err, "Could not write checksum.json");
                                }

                                log.debug("checksum.json written!");
                                cb(err, checksum);

                            });

                        }


                    });


                });
            } catch (err) {

                log.error(err, "Could not create cheksum.json");
                cb(err);

            }

        }).catch((err) => {

            log.error(err, "Could not create file tree");
            cb(err);

        });
    }



};