const lib = require("./lib.http.js");
const path = require("path");
const fs = require("fs");
const os = require("os");
const decompress = require("decompress");
const events = require("events");


const archivname = "MagicBoot-Server";
const filepath = path.join(os.tmpdir(), archivname + ".zip");
const extractpath = path.join(os.tmpdir(), archivname);


var rmdirAsync = function (path, callback) {
    fs.readdir(path, function (err, files) {
        if (err) {
            // Pass the error on to callback
            callback(err, []);
            return;
        }
        var wait = files.length,
            count = 0,
            folderDone = function (err) {
                count++;
                // If we cleaned out all the files, continue
                if (count >= wait || err) {
                    fs.rmdir(path, callback);
                }
            };
        // Empty directory to bail early
        if (!wait) {
            folderDone();
            return;
        }

        // Remove one or more trailing slash to keep from doubling up
        path = path.replace(/\/+$/, "");
        files.forEach(function (file) {
            var curPath = path + "/" + file;
            fs.lstat(curPath, function (err, stats) {
                if (err) {
                    callback(err, []);
                    return;
                }
                if (stats.isDirectory()) {
                    rmdirAsync(curPath, folderDone);
                } else {
                    fs.unlink(curPath, folderDone);
                }
            });
        });
    });
};

module.exports = function (log) {
    return function (cb) {

        const emitter = new events();
        log.trace("Download update...");

        // download archiv
        // last release from github.com
        lib.get("https://github.com/THE-CODE-FACTORY/MagicBoot-Server/archive/master.zip", (res, redirect) => {

            var length = 0;
            var precent = 0;

            // create stream, write file to temp
            const stream = fs.createWriteStream(filepath);


            stream.on("close", () => {

                log.trace("File downloaded, extract...");

                decompress(filepath, extractpath).then((files) => {

                    log.debug('Archiv extraced, fiels:', files.length);
                    cb(null, path.join(extractpath, "MagicBoot-Server-master"), files);

                }).catch((err) => {


                    log.error(err, "Could not extract update");
                    log.trace("Remove temp files/archiv");
                    cb(err);

                    fs.unlink(filepath, (err) => {
                        if (err) {

                            log.trace("COuld not deleted update archiv");

                        } else {

                            log.trace("deleted update archiv");

                        }
                    });


                    rmdirAsync(extractpath, (err, deleted) => {
                        if (err) {

                            log.trace("COuld not deleted update extract");

                        } else {

                            log.trace("deleted update extract");

                        }
                    });


                });

            });


            stream.on("error", (err) => {
                log.error(err, "Could not write archiv to hdd");
            });



            if (redirect) {
                res = redirect;
            }

            res.on("data", (chunk) => {
                precent = Math.round((length / chunk.length) * 100);
                //log.trace("Download: %d", precent);
                // emitter.emit("progress", precent)
            });

            res.on("end", function () {
                log.trace("Download Complete: %d", precent);
                // emitter.emit("progress", 100);
            });

            res.pipe(stream);

        });

        // return event emitter
        return emitter;

    }
};