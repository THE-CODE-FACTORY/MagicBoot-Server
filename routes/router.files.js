const fs = require("fs");
const os = require("os");
const path = require("path");
const multer = require('multer');
const express = require("express");
const convert = require("xml-js");

const {StringDecoder} = require('string_decoder');
const decoder = new StringDecoder('utf8');

const bodyParser = require("body-parser");


const config = require("../config.json").images;
const images = path.resolve(__dirname, "../", config.location);

module.exports = function (log, app) {

  // create new router
  // mound body parser to router
  let router = express.Router();
  let upload = multer({
    dest: os.tmpdir()
  });


  // mount router under <host>/images
  app.use("/images", router);
  // dav://127.0.0.1/images

  router.use(bodyParser.raw({
    inflate: true,
    type: "*/xml"
  }));

  router.use(function (req, res, next) {

    // convert buffer to string
    // remove dav key prefix
    req.xml = decoder.end(req.body);
    req.xml = req.xml.replace(/d:|D:|lp1:/g, "");

    // parse xml to json
    req.json = convert.xml2json(req.xml, {
      compact: false,
      trim: true,
      spaces: 2,
      //nativeType: true,
      //nativeTypeAttributes: true,
      //ignoreDeclaration: true
    });





    console.log("%s %s", req.method, req.url);
    console.log("HEADERS:", req.headers);
    //console.log("BODY:", req.body);
    console.log();


    next();

  });


  // https://www.npmjs.com/package/xml-js

  router.options("/", function (req, res) {

    res.set({
      "Allow": "OPTIONS, TRACE, GET, HEAD, POST, COPY, PROPFIND, DELETE, MOVE, PROPPATCH, MKCOL, LOCK, UNLOCK",
      "DAV": "1,2,3",
      "Content-Length": 0
    });

    res.end();

  });






  let i = 0;

  router.propfind("/", function (req, res) {






    i++;

    res.set({
      "DAV": "1,2,3",
      "Content-Type": "application/xml",
      //"X-SERVER": "Marc Stirner"
      //"Accept-Ranges": "none",
      //"Content-Length": 0
    });

    res.status(207);
    
      console.log(req.xml);
      console.log();

    if (i === 1) {

      // res.end(xml);
      


      /*
let xml = '<?xml version="1.0" encoding="utf-8"?>\n\
<D:multistatus xmlns:D="DAV:">\n\
 <D:response>\n\
  <D:href>http://127.0.0.1/images/</D:href>\n\
  <D:propstat>\n\
   <D:status>HTTP/1.1 200 OK</D:status>\n\
   <D:prop>\n\
    <D:getcontentlength>0</D:getcontentlength>\n\
    <D:resourcetype>\n\
     <D:collection/>\n\
    </D:resourcetype>\n\
   </D:prop>\n\
  </D:propstat>\n\
 </D:response>\n\
</D:multistatus>';
      */
      
      let xml = convert.js2xml({
        _declaration: {
          _attributes: {
            version: "1.0",
            encoding: "utf-8"
          }
        }, 
        "D:multistatus": {
          _attributes: {
            "xmlns:D": "DAV:"
          },
          "D:response": {
            "D:href": {
              _text: "http://127.0.0.1/images/"
            },
            "D:propstat": {
              "D:status": {
                _text: "HTTP/1.1 200 OK"                
              },
              "D:prop": {
                "D:getcontentlength": {
                  _text: "0"
                }, 
                "D:resourcetype": {
                  "D:collection": {}
                }
              }
            }
          }
        }
      }, {
        compact: true,
        spaces: 2
      });
      
      res.end(xml);



    } else if (i === 2) {

      res.end('<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:"><D:response><D:href>http://127.0.0.1/images/</D:href><D:propstat><D:status>HTTP/1.1 200 OK</D:status><D:prop><D:getcontenttype/><D:getlastmodified>Fri, 14 Sep 2018 20:23:27 GMT</D:getlastmodified><D:getetag/><D:displayname>images</D:displayname><D:getcontentlength>0</D:getcontentlength><D:creationdate>2018-09-14T20:23:01.45Z</D:creationdate><D:resourcetype><D:collection/></D:resourcetype></D:prop></D:propstat></D:response></D:multistatus>')

    } else if (i === 3) {

      res.end('<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:"><D:response><D:href>http://127.0.0.1/images/</D:href><D:propstat><D:status>HTTP/1.1 200 OK</D:status><D:prop><D:getcontenttype/><D:getlastmodified>Fri, 14 Sep 2018 20:23:27 GMT</D:getlastmodified><D:getetag/><D:displayname>images</D:displayname><D:getcontentlength>0</D:getcontentlength><D:creationdate>2018-09-14T20:23:01.45Z</D:creationdate><D:resourcetype><D:collection/></D:resourcetype></D:prop></D:propstat></D:response><D:response><D:href>http://127.0.0.1/images/Neues%20Textdokument.txt</D:href><D:propstat><D:status>HTTP/1.1 200 OK</D:status><D:prop><D:getcontenttype>text/plain</D:getcontenttype><D:getlastmodified>Fri, 14 Sep 2018 20:23:27 GMT</D:getlastmodified><D:getetag>"e03344cb684cd41:0"</D:getetag><D:displayname>Neues Textdokument.txt</D:displayname><D:getcontentlength>0</D:getcontentlength><D:creationdate>2018-09-14T20:23:27.114Z</D:creationdate><D:resourcetype/></D:prop></D:propstat></D:response></D:multistatus>')

    } else if (i === 4) {

      res.end('<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:"><D:response><D:href>http://127.0.0.1/images/</D:href><D:propstat><D:status>HTTP/1.1 200 OK</D:status><D:prop><D:getcontenttype/><D:getlastmodified>Fri, 14 Sep 2018 20:23:27 GMT</D:getlastmodified><D:getetag/><D:displayname>images</D:displayname><D:getcontentlength>0</D:getcontentlength><D:creationdate>2018-09-14T20:23:01.45Z</D:creationdate><D:resourcetype><D:collection/></D:resourcetype></D:prop></D:propstat></D:response></D:multistatus>');

    } else if (i === 5) {

      res.end('<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:"><D:response><D:href>http://127.0.0.1/images/</D:href><D:propstat><D:status>HTTP/1.1 200 OK</D:status><D:prop><D:getcontenttype/><D:getlastmodified>Fri, 14 Sep 2018 20:23:27 GMT</D:getlastmodified><D:getetag/><D:displayname>images</D:displayname><D:getcontentlength>0</D:getcontentlength><D:creationdate>2018-09-14T20:23:01.45Z</D:creationdate><D:resourcetype><D:collection/></D:resourcetype></D:prop></D:propstat></D:response></D:multistatus>')

    }

  });









































  /*
   router.all("/", function (req, res) {
   
   console.log(req.method, req.url);
   
   
   });
   
   */























  /*
   
   
   // HTTP download
   // allow us to download images
   router.get("/:file", function (req, res) {
   if (!config.external) {
   
   // images intern stored
   // create stream, make downloads possiple
   log.trace("Download image '%s'", req.params.file);
   let file = path.resolve(images, req.params.file);
   let stream = fs.createReadStream(file);
   
   // listen for errors
   stream.on("error", function (err) {
   if (err.code === "ENOENT") {
   
   // feedback
   log.debug(err, "Image '%s' not found", req.params.file);
   
   // tell client
   res.status(404).json({
   error: "Image not exists"
   });
   
   } else {
   
   // feedback
   log.debug(err, "Stream error...");
   
   // tell client
   res.status(500).json({
   error: "Server Error!"
   });
   
   }
   });
   
   // pipe content to client
   // set header for binary download
   res.setHeader("Content-Type", "application/octet-stream");
   stream.pipe(res);
   
   } else {
   
   // images external hosted
   res.status(503).json({
   error: "Images external hosted"
   });
   
   }
   
   });
   
   
   // HTTP upload 
   // allow us to upload images
   router.post("/", upload.single('image'), function (req, res) {
   if (req.file && req.body.type && !config.external) {
   
   
   // build paths
   let tmp_path = req.file.path;
   let target_path = path.resolve(images, req.file.originalname);
   
   // move the file from the temporary location to the intended location
   fs.rename(tmp_path, target_path, function (err) {
   
   if (err) {
   
   res.json({
   error: err
   });
   
   // feedback
   return log.warn(err, "Could not move image to destination");
   
   }
   
   // delet temp file from hdd
   fs.unlink(tmp_path, function (err) {
   
   if (err) {
   log.warn(err, "Could not cleanup temp files");
   }
   
   // ignore errors
   res.json({
   success: true
   });
   
   });
   
   });
   
   } else {
   if (config.external) {
   
   // images external hosted
   res.status(503).json({
   error: "Images external hosted"
   });
   
   } else {
   
   // bad request
   res.status(400).json({
   error: "No image/type found"
   });
   
   }
   }
   });
   
   
   */
};



