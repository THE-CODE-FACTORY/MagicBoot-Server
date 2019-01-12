const merge = require("merge-anything");
const format = require("string-template")
const config = require("../config.json");

module.exports = function (log, app) {

	if (process.env.NODE_ENV === "production") {
		//console.log = function () { };
	}


	// socket.io namespace
	// shortcut to computer model
	let model = app.db.model("Computer");
	let io = app.io.of("/client");


	/**
	 * Flatten a nested array
	 * @param {type} arr
	 * @returns {unresolved}
	 * @desc
	 * https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
	 */
	const flatten = function flatten(arr, key) {
		return arr.reduce(function (acc, val) {

			// val[key] = val.task/val.groups/val....
			if (Array.isArray(val[key])) {

				return acc.concat(flatten(val[key]));

			} else {

				return acc.concat(val);

			}

		}, []);
	};


	// list for connection on namepsace
	// handle socket.io api here
	io.on("connection", function (socket) {

		// 1) Client connect to socket
		// 2) Client emit poke event
		// 3) Server emit poked event
		// 4) Server listen for more "advanced" events:
		//    - systeminfo
		//    - register
		//    - installation
		//    - tasks


		// shortcut to client ip
		// find computer object in queue
		let ip = socket.handshake.address;
		let computer = app.queue.find({ ip: ip });


		// feedback
		// we dont care if computer is registerd or not
		log.debug("Computer %s connected", (computer && computer.name) || ip);


		// update computer object
		// client is now connected
		app.queue.update({
			ip: ip
		}, {
				client: {
					connected: true
				}
			});


		// computer computer state
		// @FIXME UNUSED -> remove in next version
		socket.on("state", (state) => {

			// feedback
			log.debug("Set state from client %s to %s", (computer && computer.name) || ip);
			app.queue.update({ ip }, { state });

		});



		// listen for disconnect event
		// update indicator in frontend
		socket.on("disconnect", function () {

			log.debug("Client '%s' disconnected", (computer && computer.name) || ip);

			app.queue.update({
				ip: ip
			}, {
					client: {
						connected: false
					}
				});

		});


		// wait that we get poked from client
		// emit poked event with information about our self (pc)
		socket.once("poke", function () {


			// send client self info over it/him/her/his/that
			// set language settings (@TODO!)
			socket.emit("poked", computer, config);


			// listen for systeminfo
			// update if computer want something or not
			// @TODO update db entry
			socket.on("systeminfo", function (data) {
				if (computer) {

					// feedback
					log.trace("Update computer systeminfo %s", ip);

					const obj = {
						uuid: (data.system && data.system.uuid) ? data.system.uuid : null,
						systeminfo: data,
						timestamps: merge(computer.timestamps, {
							updated: new Date().getTime()
						})
					}

					model.updateOne({
						mac: computer.mac
					}, obj, function (err, result) {

						if (err) {
							log.warn("Could not update doc for computer %s", computer.name);
							return;
						}

						// update computer in queue
						// for "live" changes
						app.queue.update({
							mac: computer.mac
						}, obj);

						log.debug("Systeminfo updated for computer %s", computer.name);

					});

				}
			});


			/**
			 * Computer registration
			 */
			(function () {

				// register computer over socket.io client
				socket.on("register", function (data, cb) {
					(new model(data)).save(function (err, result) {

						console.log(err, result)

						if (err) {
							if (err.name && err.name === "ValidationError") {

								log.info("Coputer error,", err)

								// invalid input (missing something)
								return cb({
									message: err.message
								});

							} else if (err.code && err.code === (11000 || 11001)) {

								// computer exists
								return cb({
									message: "Name or MAC allready exists"
								});

							} else {

								console.log(err);

								// something fucked up
								return cb({
									message: err
								});

							}
						} else {

							// feedback
							log.debug("Computer registered over client");

							// computer added
							cb(null, result);

						}
					});
				});

			})();


			/**
			 * Windows Installation (DISM)
			 */
			(function () {


				socket.on("installation.prepare", function () {

					log.debug("Computer %s start prepare the installation", (computer && computer.name) || ip);


					// @TODO lazy updating:
					// boradcast later
					// wie in tftp progress
					app.queue.update({
						mac: computer.mac
					}, {
							state: "prepare"
						});

				});


				socket.on("installation.start", function () {

					log.debug("Computer %s start installing Windows", (computer && computer.name) || ip);

					// @TODO lazy updating:
					// boradcast later
					// wie in tftp progress
					app.queue.update({
						mac: computer.mac
					}, {
							state: "cloning"
						});

				});

				socket.on("installation.progress", function (precent) {

					log.trace("Computer '%s' installation progress: %d%%", computer.name, precent);

					app.queue.update({
						mac: computer.mac
					}, {
							progress: {
								value: precent
							}
						});

				});

				socket.on("installation.failure", function (err) {
					// check for computer, because we can select "install windows"
					// when the computer is not registerd
					log.info(err, "Could not install Windows on client %s", (computer && computer.name) || ip);
				});

				socket.on("installation.success", function () {

					log.info("Computer '%s' deployed", computer.name);

					app.queue.update({
						mac: computer.mac
					}, {
							state: "cloned"
						});

				});

			})();


			/**
			 * Client Tasks
			 * (post-install, pre-install)
			 */
			(function () {

				// post install tasks
				// handle task errors
				// set/send next tasks
				// update queue
				socket.on("tasks", function (cb) {
					if (computer) {


						// remove old listener
						socket.removeAllListeners("task.error");
						socket.removeAllListeners("task.done");


						// shortcut to tasks
						// send total tasks to client
						const tasks = computer.client.tasks;
						var index = computer.client.task || 0;
						cb(tasks.length, index);




						log.debug("Send Task index %d to computer %s", index, ip);





						app.queue.update({
							ip
						}, {
								state: "tasks",
								client: {
									task: index
								},
								progress: {
									value: ((index + 1) / tasks.length) * 100
								}
							});




						tasks[index].command = format(tasks[index].command, computer);
						log.trace("Command %s", tasks[index].command);
						socket.emit("task", tasks[index]);






						// listen for errors
						// handle task settings here
						// retry task ? abort ? etc...
						socket.on("task.error", function (err) {
							if (tasks[index].settings.retry) {

								var task = tasks[index];

								if (!task.attempt) {
									task.attempt = 0;
								}

								setTimeout(function () {
									if (task.attempt < task.settings.attempts) {

										log.trace("Retry task %s, attempt: %d", task.name, task.attempt);

										task.attempt++;
										socket.emit("task", task);

									} else {

										log.trace("Max attempts reacehd: %d / %d", task.attempt, task.settings.attempts);
										io.of("/management").emit("notification", "Fehler in Task `${task.name}`<br />Computer: `${computer.name}`", "warning");

										console.log("notify user, on u-I")

										app.queue.update({
											ip
										}, {
												progress: {
													style: "bg-danger progress-bar-striped progress-bar-animated"
												}
											});

									}

								}, task.attempt * 3000);


							} else {

								// feedback
								io.of("/management").emit("notification", "Fehler in Task `${task.name}`<br />Computer: `${computer.name}`", "warning");
								log.debug("Task fail, %s on %s", tasks[index].name, computer.name);

								app.queue.update({
									ip
								}, {
										progress: {
											style: "bg-danger progress-bar-striped progress-bar-animated"
										}
									});
							}
						});



						// task successful done
						// continue with next one
						// update computer object
						socket.on("task.done", function () {

							log.debug("Computer completed task %s", tasks[index].name);
							log.trace("Count index up, and send new one");


							if (tasks.length > index + 1) {
								setTimeout(function () {

									// increment index
									index++;

									// update computer object
									app.queue.update({
										ip
									}, {
											client: {
												task: index
											},
											progress: {
												// perhaps + 1
												value: ((index + 1) / tasks.length) * 100
											}
										});

									console.log("Send next task, index %d", index);

									setTimeout(function () {

										// send new task
										tasks[index].command = format(tasks[index].command, computer);
										log.trace("Command %s", tasks[index].command);

										socket.emit("task", tasks[index]);

									}, 1000);


								}, 1000);
							} else {

								log.trace("No tasks more, we are finish here");
								io.of("/management").emit("notification", "Computer `${computer.name}` deployed!", "success");

								app.queue.update({
									ip
								}, {
										state: "complete",
										progress: {
											value: 100,
											style: "bg-success"
										}
									});

							}

						});


					} else {

						// feedback, this is fucking bullshit...
						log.info("Unregistered computer (%s) want tasks...", ip);

					}
				});


			})();


			/**
			 * Caputer image
			 */
			(function () {

				socket.on("capture.start", function () {
					app.queue.update({
						ip
					}, {
							state: "capture",
							progress: {
								value: 0
							}
						});
				});

				socket.on("capture.progress", function (precent) {

					log.trace("Capture image from %s: %d%%", computer.name, precent);

					app.queue.update({
						ip
					}, {
							progress: {
								value: precent
							}
						});

				});

			})();


		});


	});

};