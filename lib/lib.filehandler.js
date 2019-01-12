const util = require("util");
const config = require("../config.json").services.tftp;
const images = require("../config.json").images;
const state = require("../config.json").services.state;
const path = require("path");
const fs = require("fs");
const url = require("url");



module.exports = function (log, server, queue) {

  var connections = [];

  if (config.host === "0.0.0.0") {
    log.error("TFTP Server binding to IP 0.0.0.0, requests could not be proceeded!");
  }


  /**
   * Update Queue interval
   *@TODO only when connections etablished & request activ!
   */
  (function () {

    var updateInterval = 1000;

    if (process.env.NODE_ENV !== "prodcution") {
      updateInterval = 10000;
    }

    setInterval(function () {
      if (connections.length > 0) {

        // brodcast updated progress
        log.trace("Broadcast queue");
        queue.update();

      }
    }, updateInterval);

  })();



  // Dynamic file handler(s)
  // default = syslinux menu (config)
  // inform.sh = state after cloinezilla image restoring
  // restore.sh = start clonezilla image restoring
  const handler = {
    "pxelinux.cfg/default": function (computer, write) {

      if (computer) {
        queue.update({
          mac: computer.mac
        }, {
            state: "loading"
          });
      }

      // https://www.syslinux.org/wiki/index.php?title=SYSLINUX
      // https://github.com/bluerider/liveroot/blob/master/examples/syslinux.cfg.example
      // https://github.com/joyent/syslinux/blob/master/doc/menu.txt
      // https://willhaley.com/blog/extlinux-menu/


      // behavor:
      // computer is unknown
      // -> start windows pe with client
      // 
      // computer is known
      // -> status = diagnostic: all entrys
      // -> status != diagnostic:
      //   -> image assigned -> clonezilla/windows
      //   -> no image -> all entrys
      let content = "";


      if (computer && !computer.image) {

        // feedback
        log.info("Computer (%s) has no image assigned, show diagnostic menu", computer.name);

      }


      if (computer && (computer.state === "diagnostic" || !computer.image)) {

        // menu settings
        content += "UI vesamenu.c32\n\n";
        content += "PROMPT 0\n"; // PROMPT 0
        content += "TIMEOUT 0\n\n"; // TIMEOUT 0

        // menu layout settings
        content += "MENU TITLE MagicBoot - Deployment System\n";
        content += "MENU COLOR TITLE 0 #ffffffff #00000000 std\n";
        content += "MENU RESOLUTION 640 480\n";
        content += "MENU BACKGROUND background.png\n\n";

      }


      // Diagnostic entrys....
      // - Memtest86+
      // - Hardware Detection Tool
      (function () {
        if (computer && (computer.state === "diagnostic" || !computer.image)) {

          // memtest
          content += "LABEL memdisk\n";
          content += " MENU LABEL Memtest86+\n";
          content += " KERNEL memtest86+-5.01\n\n";

          // hdt
          content += "LABEL memdisk\n";
          content += " MENU LABEL Hardware Detection Tool\n";
          content += " KERNEL hdt.c32\n\n";

          // separator
          content += "MENU SEPARATOR\n\n";

        }
      })();


      // WindowsPE 10 (incl. client) entry
      // default selection
      // boot when computer is not registered 
      (function () {
        if (!computer || (computer && (computer.state === "diagnostic" || (computer.image && computer.image.type === "windows") || !computer.image))) {

          content += "DEFAULT pe\n\n";
          content += "LABEL pe\n";
          content += " MENU LABEL WindowsPE 10\n";
          content += " KERNEL memdisk\n";
          content += " INITRD WinPE_amd64.iso\n";
          content += " APPEND iso raw\n\n";

        }
      })();


      // CloneZilla	entry	
      (function () {
        if (computer && (computer.state === "diagnostic" || (computer.image && computer.image.type === "clonezilla") || !computer.image)) {

          let restore = false;

          if (computer.state !== "diagnostic" && computer.image && computer.image.type === "clonezilla") {
            restore = true;
            content += "DEFAULT clonezilla\n\n";
          }


          content += "LABEL clonezilla\n";
          content += " MENU LABEL CloneZilla Live\n";
          content += " KERNEL vmlinuz\n";

          // clonezilla boot options
          // http://clonezilla.org/fine-print-live-doc.php?path=clonezilla-live/doc/99_Misc/00_live-boot-parameters.doc
          // https://drbl.org/faq/fine-print.php?path=./2_System/113_fully_automatically_restoring.faq#113_fully_automatically_restoring.faq

          let options = {
            initrd: "initrd.img",
            boot: "live",
            config: "",
            nomodeset: "",
            nosplash: "",
            union: "overlay",
            "keyboard-layouts": "NONE", //"keyboard-layouts": "NONE"
            edd: "on",
            noswap: ""
          };


          if (restore) {

            // auto restore
            log.trace("CloenZilla: Auto-restore");
            options["ocs_preload1"] = "tftp://" + config.host + "/mount.sh";
            options["ocs_preload2"] = "tftp://" + config.host + "/restore.sh";
            options["ocs_preload3"] = "tftp://" + config.host + "/inform.sh";
            //options["ocs_prerun"] = "\"sleep 5\"";
            //options["ocs_prerun1"] = "\"/opt/mount.sh\"";
            //options["ocs_prerun2"] = "sleep 10";
            options["ocs_live_run"] = "\"/opt/restore.sh\"";
            options["ocs_postrun1"] = "\"/opt/inform.sh\"";
            //options["ocs_debug"] = "1";
            options["nolocales"] = "";
            options["ipv6.disable"] = "1";
            options["vga"] = "788";
            options["noeject"] = "";

          } else {

            // live settings
            log.trace("CloenZilla: live-mode");
            options["username"] = "user";
            options["components"] = "";
            options["quiet"] = "";
            options["nodmraid"] = "";
            options["locales"] = "";
            options["ocs_live_run"] = "ocs-live-general";
            options["ocs_live_extra_param"] = "";
            options["ocs_live_batch"] = "no";
            options["net.ifnames"] = "0";
            options["noprompt"] = "";

          }

          // last ? 
          options["fetch"] = "tftp://" + config.host + "/filesystem.squashfs";


          // build append string
          content += " APPEND";
          for (let key in options) {
            let value = options[key];
            if (value === "") {
              content += " " + key;
            } else {
              content += " " + key + "=" + value;
            }
          }

          content += "\n\n";
          content += "MENU SEPARATOR\n\n";

        }
      })();


      // local HDD
      (function () {

        content += "LABEL local\n";
        content += " MENU LABEL Lokale Festplatte\n";
        content += " LOCALBOOT 0\n";
        content += " Type 0x80\n\n";
        content += "MENU SEPARATOR\n\n";

      });


      // reboot entry
      // shutdown entry
      (function () {
        if (computer && (computer.state === "diagnostic" || !computer.image)) {

          content += "";

          // reboot
          content += "LABEL reboot\n";
          content += " MENU LABEL Neustarten\n";
          content += " COM32 reboot.c32\n\n";

          // shutdown
          content += "LABEL shutdown\n";
          content += " MENU LABEL Herunterfahren\n";
          //content += " TEXT HELP\n";
          //content += "  Shutdown the computer\n";
          //content += " ENDTEXT\n";
          content += " COM32 poweroff.c32\n\n";

        }
      })();


      // send content
      write(content);

    },
    "/inform.sh": function (computer, write) {

      // build content for file
      let message = "#!/bin/bash\n";
      message += "echo " + (new Buffer(JSON.stringify({ status: "cloned" })).toString('base64')) + " | nc " + state.host + " " + state.port + "\n";
      message += "shutdown -r -t 5";

      // send content
      write(message);

    },
    "/mount.sh": function (computer, write) {

      let message = "#!/bin/bash\n";


      if (images.proxy.enabled && images.external) {

        // override location
        // so we can set us in the middle
        let target = new url.URL(images.location);
        target.host = images.proxy.host;
        target.port = images.proxy.port;
        images.location = target.href;

      }



      if (images.type === "davfs") {


        // create entry in /etc/fstab
        // add credentials to /etc/davfs2/secrets
        message += "sudo echo \"" + images.location + " /home/partimag davfs\" >> /etc/fstab\n";

        // use authentication ?
        if (images.authentication.enabled) {
          message += "sudo echo \"" + images.location + " " + images.authentication.username + " " + images.authentication.password + "\" >> /etc/davfs2/secrets\n\n";
        }

        // mount webdav
        message += "sudo mount " + images.location;

      } else if (images.type === "cifs") {

        log.warn("Not implement at this moment!");

      } else {

        // feedback
        log.warn("Unsupported image type, check config.json, 'images' section");

      }



      console.log(message);
      write(message);

    },
    "/restore.sh": function (computer, write) {

      // set state to "cloneing"
      // start clonezilla			
      let message = "#!/bin/bash\n";
      message += "sudo /opt/mount.sh\n\n";
      message += "echo \"" + (new Buffer(JSON.stringify({ state: "cloning" })).toString('base64')) + "\" | nc " + state.host + " " + state.port + "\n";
      message += "sudo /usr/sbin/ocs-sr -scr -p true restoredisk " + computer.image.resource + " sda\n\n";
      // @TODO Add exit code evaluation
      // @TODO Set right HDD/M2 SSD disk selection based on image
      // https://www.cyberciti.biz/faq/shell-how-to-determine-the-exit-status-of-linux-and-unix-command/

      // send content
      console.log(message);
      write(message);

    }
  };


  // remove default listener
  // hanlde request by ourself
  server.removeAllListeners("request");

  server.on("request", function (req, res) {

    // override "\" with "/"
    // trace requests
    req.file = req.file.replace(/\\/, "/");
    log.debug("Request: %s, from %s", req.file, req._ps._writer._address);

  });

  server.on("request", function (req, res) {
    //setTimeout(function () {


    // add connection
    connections.push(req);


    req.on("error", function (err) {
      if (err.code === "ENOENT") {
        if (computer) {

          // registered computer, this should not happen
          log.warn(err, "Could not find file: %s, client: %s", req.file, req._ps._writer._address);

        } else {
          if (process.env.NODE_ENV !== "production") {

            // unregistered ?
            // dont spam logfiles with unneeded warn messages
            // unregistered computer try to find a config file for syslinux
            // see: https://www.syslinux.org/wiki/index.php?title=PXELINUX#Configuration
            //log.debug(err, "File '%s' not found, client: %s", req.file, req._ps._writer._address);

          }
        }
      } else if (err.message && err.message === "TFTP Aborted") {

        // feedback
        // @TODO/@FIXME Handle abort -> remove from connections, etc ?!?!
        // - ignore ?!
        log.trace("Request %s aborted from %s", req.file, req._ps._writer._address);

      } else {
        if (req.file === "/filesystem.squashfs") {
          if (process.env.NODE_ENV !== "production") {

            // ignore filesystem.squashfs errors
            // 2 requests are made, but only 1 will be downloaded
            // the second one results in a timeout error
            // @FIXME -> same as TFTP Abroted -> "integrity check"?
            log.debug(err, "filesystem.squashfs error (timeout?)");
            log.debug(err, "switch to log level trace if you want to see more detailed messages");

          }
        } else {

          // feedback
          // here are sometimes errors about, "request abort, timeout"
          console.log(err, err.message)
          log.warn(err, "Something is wrong with the request (%s), client: %s", req.file, req._ps._writer._address);

        }
      }
    });

    req.on("close", function () {
      connections.splice(connections.indexOf(this), 1);
    });


    // find computer in queue
    let computer = queue.find({
      ip: req._ps._writer._address
    });


    if (computer) {
      if ((["pending", "loading"].indexOf(computer.state)) === -1) {

        log.debug("Continue Installing Computer '%s'", computer.name);
        req.abort("Continue Installing");

        return;

      }
    };



    /**
     * Write content to <res>
     * @param {type} content
     * @returns {undefined}
     */
    function write(content) {
      res.setSize(content.length);
      res.write(content);
      res.end();
    }


    /**
     * Select filehandler
     * @returns {undefined}
     */
    (function () {
      if (handler[req.file]) {

        // handle dynamic files
        // - restore.sh/inform.sh
        // - pxelinux.0/default
        log.trace("dynamic file handler");
        handler[req.file](computer, write);

      } else if (computer && (computer.uuid && (req.file === "pxelinux.cfg/" + computer.uuid.toLowerCase()))) {

        // pxelinux.cfg/default
        // for faster boot if uuid is set
        log.trace("pxelinux.cfg/default, shortcut (uuid)");
        handler["pxelinux.cfg/default"](computer, write);

      } else if (computer && (req.file === "pxelinux.cfg/01-" + computer.mac.replace(/:/g, "-").toLowerCase())) {

        // pxelinux.cfg/default
        // for faster boot if uuid not found/set over mac
        log.trace("pxelinux.cfg/default, shortcut (mac)");
        handler["pxelinux.cfg/default"](computer, write);

      } else {

        // https://github.com/gagle/node-tftp/blob/master/lib/server.js#L124
        if (req._listenerCalled || req._aborted) {
          return;
        }

        req._listenerCalled = true;

        // built-in request handler
        log.trace("use static file handler (%s)", req.file);

        // build path to file inc. filename
        let filename = path.join(__dirname, "../", config.root, "/" + req.file);

        // check file stats
        fs.stat(filename, function (err, stats) {

          if (err) {

            req.on("abort", function () {
              req.emit("error", err);
            });

            if (err.code === "ENOENT") {

              // enoent error not so bad
              // results most of bad client requests
              //log.debug("File %s not found", req.file);
              return req.abort("File not found");

            } else {

              // sometimes we should look
              //log.warn(err, err.message);
              return req.abort(err.message);

            }

          }

          var aborted = false;

          // read file from hdd as stream
          let stream = fs.createReadStream(filename);


          // listen for errors
          stream.on("error", function (error) {

            req.on("abort", function () {
              aborted = true;
              req.emit("error", error);
            });

            req.abort(err.ENOENT.message);
          });

          req.on("error", function () {
            //Error from the rs
            if (aborted)
              return;
            stream.destroy();
          });

          /**
           * Calculate precent send
           * @returns {undefined}
           */
          (function () {

            // init stuff
            let precentComplete = 0;
            let bytesComplete = 0;
            let interval = null;
            let lastUpdate = 0;

            if (process.env.NODE_ENV !== "production") {
              interval = setInterval(function () {
                log.trace("%s %d%% loaded (%s)", req.file, Math.floor(precentComplete), req._ps._writer._address);
              }, 2000);
            }


            // wait for data
            stream.on("data", function (chunk) {

              // calculate (do math here)
              bytesComplete += chunk.length;
              precentComplete = (bytesComplete / stats.size) * 100;

              if ((new Date().getTime() - lastUpdate) >= 2000) {

                // set last timestep we send the update
                lastUpdate = new Date().getTime();

                // PROGRESS UPDATE:
                // update queue, witout boradcast (false)
                // broadcast changes in setInterval(?)
                // qeueue.update(); to broadcast changes


                queue.update({
                  ip: req._ps._writer._address
                }, {
                    progress: {
                      value: precentComplete
                    }
                  }, true);

              }

            });


            stream.on("error", function () {
              lastUpdate = 0;
              precentComplete = 0;
            });


            // wait for end (file send)
            stream.on("end", function () {

              precentComplete = 100;
              bytesComplete = stats.size;
              lastUpdate = 0;
              clearInterval(interval);

              queue.update({
                ip: req._ps._writer._address
              }, {
                  //state: "loaded",
                  progress: {
                    value: 100
                  }
                });

              log.trace("%s %d%% loaded", req.file, Math.floor(precentComplete));
              log.debug("File '%s' sent to client %s", req.file, req._ps._writer._address);

            });


            // production = no interval
            if (process.env.NODE_ENV !== "production") {

              stream.on("error", function () {
                clearInterval(interval);
              });

              req.on("abort", function () {
                clearInterval(interval);
              });

              req.on("error", function () {
                clearInterval(interval);
              });

            }

          })();


          // pipe content to client
          res.setSize(stats.size);
          stream.pipe(res);

        });

      }
    })();


    //}, 100);
  });

  // close in service
  return connections;

};