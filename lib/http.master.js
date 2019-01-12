const net = require("net");
const ip = require('ip');
const os = require("os");
const cluster = require("cluster");
const Discover = require("node-discover");

const config = require("../config.json").services.http;
const queue = require("../lib/lib.queue.js");


// connect to server
queue.connect();





module.exports = function (log) {

	// create seed
	const seed = (Math.random() * 0xffffffff) | 0;


	/**
	 * Hash IP
	 * @type Number|seed
	 */
	function hashHelper(ip) {

		var hash = seed;

		for (var i = 0; i < ip.length; i++) {

			let num = ip[i];

			hash += num;
			hash %= 2147483648;
			hash += (hash << 10);
			hash %= 2147483648;
			hash ^= hash >> 6;

		}

		hash += hash << 3;
		hash %= 2147483648;
		hash ^= hash >> 11;
		hash += hash << 15;
		hash %= 2147483648;

		return hash >>> 0;

	}

	// workers
	let workers = [];

	// create tcp worker
	// for incoming connections
	// route them to the right worker
	let tcp = net.Server({
		pauseOnConnect: true
	}, function balance(socket) {

		var addr = ip.toBuffer(socket.remoteAddress || '127.0.0.1');
		var hash = hashHelper(addr);

		// feedback
		log.trace("Balancing connection %j", addr);

		// send request to worker
		workers[hash % workers.length].send('sticky:balance', socket);

	});


	tcp.on("error", function (err) {
		if (err.code === "EACCES") {

			log.error(err, "Could not start because of insufficient rights, (sudo?)");

		} else if (err.code === "EADDRINUSE") {

			log.error(err, "Address/port in use, no clean shutdown ?");

		} else {

			log.error(err, "Could not start Server");

		}
	});


	// liste for listening event
	tcp.once('listening', function () {

		let addr = this.address();
		log.info("Server listening on %s:%d", addr.address, addr.port);




		// spawn HTTP workers
		(function () {

			let numCpus = os.cpus().length;
			if (!config.cluster) {
				numCpus = 1;
			}

			// spawn works 
			// cluster = true = cpu cores
			// cluster = false = 1
			for (var i = 0; i < numCpus; i++) {

				let worker = cluster.fork();
				workers.push(worker);

				// feedback
				log.debug("Spawn worker #%d, PID:%d", i, worker.process.pid);


				worker.on("exit", function (code) {
					if (code === 0 || !code) {

						// feedback
						log.debug("Worker #%d shutdown", i);
						workers.splice(worker, 1);

					} else {

						// feedback
						log.warn("Worker #%d crashed, code: %d", i, code);

					}
				});

			}


		})();

	});


	// fire up
	tcp.listen(config.port, config.host);



	process.on("message", function (event) {
		if (event === "shutdown") {

			// feedback
			log.trace("Graceful shutdown...");

			tcp.on("close", function () {

				// close worker
				workers.forEach(function (worker, index) {
					setTimeout(function () {

						worker.send("shutdown");

					}, index * 1000);
				});

				// workers down ?
				setInterval(function () {
					if (workers.length === 0) {

						log.info("Server closed");
						process.exit(0);

					}
				}, 100);

			});

			// close server
			tcp.close();

		}
	});


};