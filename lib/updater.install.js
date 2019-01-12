const path = require("path");
const sumLocal = require("../checksum.json");

const sumRemote = {
    'tftp-root/filesystem.squashfs': 'b287ea75a1f110b64b22fb5f705d31a4',
    'tftp-root/WinPE_amd64.iso': 'f4eb37346bb3afc0bbc63cda412d6e0e',
    'tftp-root/asdfasdf.iso': 'f4rb37346bb3afc0bbc63cda412d6e0e'
};


// über remote array iterate
// check ob file in local array
// -> nein: copy from remote
// -> ja: compare md5


for (file in sumRemote) {
    if (sumLocal[file]) {


        console.log(file);
        console.log("Remote: ", sumRemote[file]);
        console.log("Local: ", sumLocal[file]);
        console.log();


        if (sumRemote[file] === sumLocal[file]) {

            console.log("File same");

        } else {

            console.log("Override file: %s", file);

        }

    } else {

        console.log("Copy file:", file)

    }
};
