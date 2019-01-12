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



const mb = path.resolve(__dirname, "../");
const ignore = [
    "node_modules",
    "log",
    "CHECK",
    "config.json",
    "package-lock.json",
    "checksum.json"
];


console.log(mb);
tree(mb, ignore).then((files) => {

    var checksum = {};
    var counter = files.length;

    try {
        files.forEach((file) => {


            fsp.readFile(path.join(mb, file), {
                encoding: "utf8"
            }, function (err, content) {

                if (err) {
                    throw err;
                }

                if (!content) {
                    return console.log("Ignore file, %s, no content", file);
                }


                // create chceksum for file
                const hash = crypto.createHash('md5');
                checksum[file] = hash.update(content).digest('hex');
                counter--;


                if (counter === 0) {

                    const end = new Date().getTime();

                    console.log("Calculated in %dms, (%d, files)", end - start, files.length);
                    console.log(checksum)

                    fsp.writeFile(path.resolve(__dirname, "../checksum.json"), JSON.stringify(checksum, null, 2), function (err) {

                        if (err) {
                            return console.log(err)
                        }

                        console.log("checksum.json written!");

                    });

                }


            });


        });
    } catch (err) {

        console.log("Could not create cheksum.json", err)

    }

}).catch((err) => {

    console.log("COuld not create file tree", err);

});