const http = require("http");
const https = require("https");


function redirect(res, cb) {
    if (res.statusCode > 300 && res.statusCode < 400 && res.headers["location"]) {

        console.log("Redirect: ", res.headers.location)

        get(res.headers.location, function (red) {
            cb(res, red);
        });

    } else {

        cb(res);

    }
}


function get(url, cb) {

    const request = https.request(url);
    request.on("response", function (res) {
        redirect(res, cb);
    });

    request.on("error", function (err) {
        console.log("ERR>>", err)
    });

    request.end();
    return request;

}




module.exports = {
    get,
    redirect
};