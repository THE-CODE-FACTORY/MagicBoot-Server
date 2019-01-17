const fs = require("fs");
const child = require("child_process");
const path = require("path");
const pkg = require("./package.json");
const queue = require("./lib/lib.queue.js");
const config = require("./config.json");
const log = require("./lib/lib.logger.js")("SYSTEM");


// feedback
process.stdout.write('\033c');
console.log("Starting MagicBoot-Server v%s...", pkg.version);
process.title = "MagicBoot - Server v" + pkg.version;
log.debug("Main thread has pid: %d ", process.pid);


// wrapper for child
var services = {};
var timeout = 2000;


if (process.env.NODE_ENV !== "production") {
	log.warn("Not in production mode!");
	timeout = 100;
}


/**
 * Startup service(s)
 * @param {type} name Service name
 * @returns {undefined}
 */
const startup = function startup(name) {

	// feedback
	log.trace("Forking service '%s'", name);


	// build path to module
	// fork/run service module
	let module = path.resolve(__dirname, "./services/service." + name + ".js");
	let service = services[name] = child.fork(module);


	// feedback
	log.info("Spawned service '%s', PID: %d", name, service.pid);
	queue.emit("service.started", name);

	/*
	 service.on("error", function (err) {
	 if (err.code === "EPIPE") {
	 
	 log.warn("EPIPE ERROR! -> %s", name);
	 
	 } else {
	 
	 
	 // not sure what we do here
	 // respawn when no exit event fired ?
	 log.error(err, "We got a error from service %s, view logfile", name);
	 log.debug(err.message);
	 
	 }
	 });
	 */


	// listen for exit events
	// restart service if code not 0
	service.on("exit", function (code) {
		if (code === 0 || !code) {

			// log exit from service
			// possible during a restart 
			log.info("Service '%s' exited with code: 0", name);
			delete services[name];

			// service stopped
			queue.emit("service.stopped", name);

		} else {

			// feedback
			log.error("Service '%s' crashed with code %d", name, code);

			// cleanup & restart
			delete services[name];
			if (config.startup.restart) {

				// feedback
				log.debug("Restart service %s after %dms", name, config.startup.delay);

				// restart on exit ?
				// pass some time between crash & restart
				setTimeout(function () {
					startup(name);
				}, config.startup.delay);

			}

		}
	});

};


/**
 * Shutdown service(s)
 * @param {type} name Service name
 * @returns {undefined}
 */
const shutdown = function shutdown(name) {
	if (name) {

		log.info("Shutdown service %s", name);

		// tell the clients to shut the fuck up
		if (services[name].connected && services[name].channel) {
			services[name].kill("SIGINT");
			//services[name].send("shutdown");
		}

	} else {

		log.info("Shutdown server...");

		setTimeout(function () {

			// shutdown services
			for (let name in services) {
				if (services[name].connected && services[name].channel) {

					// tell the clients to shut the fuck up
					log.trace("Shutdown service %s", name);
					services[name].send("shutdown");

				} else {

					// feedback, this should not happend
					log.warn("Service '%s' closed IPC channel", name);

				}
			}

			// services down ?
			setInterval(function () {
				if (Object.keys(services).length === 0) {

					console.log();
					console.log("Bye...");
					process.exit(0);

				}
			}, 1000);


		}, timeout);
	}
};



/*
 * Fork services
 * - http (API&UI)
 * - state (computer state)
 * - tftp (PXE Boot files)
 * - dhcp (ip addresses & boot file)
 * - proxy (VNC/loading state)
 * - updater (keep the software up to date)
 * - autodiscover (client)
 * @returns {undefined}
 */
const forkServices = function forkServices() {
	["http", "state", "tftp", "dhcp", "proxy", "updater", "autodiscover"].forEach(function (name, index) {


		if (config.services[name] && config.services[name].listen) {
			if (config.startup && config.startup.harmony && config.startup.delay) {

				// spawn services after each other
				// with delay based on it index
				setTimeout(function () {
					startup(name);
				}, config.startup.delay * index);

			} else {

				// spawn services immediately
				startup(name);

			}
		} else {

			// feedback
			log.debug("Ignore service '%s', not listen", name);

		}


	});
};


// check if config file exists
// start installer or server
fs.stat("./config.json", function (err, stats) {
	if (err && err.code === "ENOENT") {


		// require installer
		// start http server
		// allow ui based configuration
		return require("./installer.js");


	} else if (stats) {


		// start ipc server
		// allow communication between processes
		queue.server();





		queue.on("service.start", function (name) {

			if (services[name]) {
				return log.trace("Could not start service '%s', allready started", name);
			}

			startup(name);

		});

		queue.on("service.stop", function (name) {

			if (!services[name]) {
				return log.trace("Could not stop service '%s', not started", name);
			}

			shutdown(name);

		});






		// test mongodb connection
		// exit on error, prevent further services startup
		// when connection got lost, shutdown childs & exit
		if (config.startup && config.startup.harmony) {

			// feedback
			log.debug("Use harmony startup");

			// test mongodb connection
			let db = require("./lib/lib.database.js");

			// exit on error
			db.connection.on("error", function () {
				shutdown();
				//process.exit(1);
			});


			db.connection.on("connect", function () {

				// feedback
				// @TODO connection url
				log.info("Connected to database");
				forkServices();

			});

		} else {

			// fork service
			setTimeout(function () {
				forkServices();
			}, timeout);

		}


	}
});


// handle shutdown / kill signal
// @FIXME Garbage on windows:
// childs exit with strage exit code...
process.stdin.resume();

// kill signal
process.on('SIGTERM', function () {
	shutdown();
});

// CTRL+C
process.on('SIGINT', function () {
	shutdown();
});