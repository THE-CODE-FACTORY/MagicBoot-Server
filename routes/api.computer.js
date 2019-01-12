const util = require("util");
const express = require("express");
const merge = require("merge-anything");

module.exports = function (log, app) {

	// <host>/api/computer
	// shortcut to model & router
	router = express.Router();
	let model = app.db.model("Computer");


	router.use(function (req, res, next) {
		if (req.query && req.query.populate) {

			let str = req.query.populate.split(",");

			// special thanks to Nina Scholz
			// https://stackoverflow.com/a/52494913/5781499	
			req.populate = str.reduce((r, s) => {
				s.split('.').reduce((a, path) => {
					var object = a.find(o => o.path === path);
					if (!object) {
						a.push(object = { path, populate: [] });
					}
					return object.populate;
				}, r);
				return r;
			}, []);

		}

		next();

	});


	router.get("/:id?", function (req, res) {

		// mongoose cb handler
		let handle = function (err, data) {

			if (err) {
				log.warn(err, "Could not fetch data from db");
				return res.status(500).json({
					error: err
				});
			}

			if (!data) {
				return res.status(404).end();
			}

			// success
			res.json(data);

		};

		let query = model.find({});

		if (req.params.id) {
			query = model.findOne({ _id: req.params.id });
		}

		if (req.populate) {
			query.populate(req.populate);
		}

		// execute query
		query.exec(handle);

	});


	router.put("/", function (req, res) {
		(new model(req.body)).save(function (err, data) {

			if (err) {

				console.log("Error", err)

				if (err.name && err.name === "ValidationError") {

					// invalid input (missing something)
					return res.status(400).json({
						error: err.message
					});

				} else if (err.code && err.code === (11000 || 11001)) {

					// computer exists
					return res.status(400).json({
						error: "Name or MAC allready exists"
					});

				}

				log.warn(err, "Could not add computer");

				return res.status(500).json({
					error: err
				});

			}

			if (req.populate) {


				data.populate(req.populate, function (err, result) {

					if (err) {
						log.warn(err, "Could not add computer");
						return res.status(500).json({
							message: err
						});
					}

					res.json(result._doc);

				});

			} else {

				console.log(">>", data)
				res.json(data);

			}

		});
	});


	router.post("/:id", function (req, res) {
		model.findOne({ _id: req.params.id }, function (err, doc) {

			if (err) {

				log.warn(err, "Could not update computer");
				return res.json({
					error: err
				});

			}

			if (!doc) {
				return res.status(404).end();
			}

			let populate = [];
			let computer = app.queue.find({
				mac: doc.mac
			});

			req.body.timestamps = {
				edited: new Date().getTime()
			};

			model.updateOne({
				_id: doc._id
			}, req.body, function (err, result) {

				if (err) {
					log.warn(err, "Could not update group %s", req.params.id);
					return res.status(500).json({
						error: err
					});
				}

				let data = merge(doc, req.body);
				console.log(doc, "in api.group.js to do -> computer/other api'S");
				res.json(data);



				if (computer) {

					app.queue.update({
						mac: doc.mac
					}, data);

				}

			});

		});
	});


	router.delete("/:id", function (req, res) {
		model.findOne({ _id: req.params.id }, function (err, doc) {

			if (err) {
				log.warn(err, "Could not delete computer %s", req.params.id);
				return res.status(500).json({
					error: err
				});
			}

			if (!doc) {
				return res.status(404).end();
			}

			// remove document
			doc.remove(function (err, result) {

				if (err) {
					log.warn(err, "Could not delete computer %s", req.params.id);
					return res.status(500).json({
						error: err
					});
				}

				console.log("DELETE COMPUTER --> api.computer.js", result);

				// success
				res.json({
					success: true,
					data: result
				});

			});

		});
	});



	router.put("/:id/diagnostic", function (req, res) {

		app.queue.emit("queue.diagnostic", {
			mac: req.body.mac
		});

		res.json({
			"success": true
		});

	});





	// export router
	return router;

};




/*
[
	{
		"timestamps": {
			"created": 1546440791990
		},
		"groups": [
			"5c28f670e48fbf393db650c6",
			"5c28f683e48fbf393db650c7",
			"5c28f691e48fbf393db650c8"
		],
		"tasks": [
			"5c28fa141cc2f93d793d50f1"
		],
		"_id": "5c2ce7c242e4dd1e02d8ae6d",
		"name": "1546479184247",
		"uuid": "-",

      
]*/