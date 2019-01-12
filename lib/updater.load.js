const lib = require("./lib.http.js");
const path = require("path");
const fs = require("fs");
const os = require("os");
const decompress = require("decompress");


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


lib.get("https://github.com/mStirner/node-dmx-client/archive/master.zip", (res, redirect) => {

    var length = 0;
    var precent = 0;

    // create stream, write file to temp
    const stream = fs.createWriteStream(filepath);

    stream.on("close", () => {

        console.log("File Downloaded & on HDD -> extract");

        decompress(filepath, extractpath).then((files) => {

            console.log('extracted!\ncreate checksum from files....', files.length);

        }).catch((err) => {


            console.log("Could not extract", err);

            fs.unlink(filepath, (err) => {
                if (err) {

                    console.log("COuld not deleted update archiv");

                } else {

                    console.log("deleted update archiv");

                }
            });


            rmdirAsync(extractpath, (err, deleted) => {
                if (err) {

                    console.log("COuld not deleted update extract");

                } else {

                    console.log("deleted update extract");

                }
            });

        });

    });

    stream.on("error", (err) => {
        console.log("STREAM ERROR,", err);
    });


    //console.log("1; ", res.headers);
    console.log("2; ", redirect.headers);


    if (redirect) {

        if (redirect.headers.length) {
            length = redirect.headers.length;
        } else if (res.headers.length) {
            length = res.headers.length;
        }

        // override res with redirect response	
        res = redirect;

    }

    res.on("data", (chunk) => {
        // check if content length

        precent = Math.round((length / chunk.length) * 100);
        console.log("\rDownload: %d", precent);

    });

    res.on("end", function () {

        console.log("Download Complete: %d", precent);

    });

    res.pipe(stream);

});