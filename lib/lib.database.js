const url = require("url");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const config = require("../config.json").database;
const log = require("./lib.logger.js")("DATABASE");


// format config object to uri
let uri = "mongodb://" + config.host + ":" + config.port + "/magic-boot";


// build/override/correct
uri = new url.URL(uri);
uri.protocol = "mongodb";
uri.host = config.host;
uri.port = config.port;
uri.path = "/magic-boot";


// set authentification
if (config.authentication.enabled) {
  uri.username = config.username;
  uri.password = config.password;
}


// connect to database
mongoose.connect(uri.href, {
  useNewUrlParser: true,
  user: config.username,
  pass: config.password,
  keepAlive: true,
  keepAliveInitialDelay: 300000
});

mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

mongoose.connection.on("error", function (err) {
  log.error(err, "Could not connect to database '%s' from pid: ", uri.href, process.pid);
});

mongoose.connection.on("open", function () {
  log.debug("Connected to %s, from process: %d", uri.href, process.pid);
});


process.on('shutdown', function () {
  mongoose.connection.close();
});


/**
 * Computer schema/model
 * @returns {undefined}
 */
(function () {

  // create schema
  let schema = new mongoose.Schema({

    // basic stuff
    name: { type: String, required: true, unique: true },
    uuid: { type: String, /*unique: true*/ },
    mac: { type: String, unique: true },
    systeminfo: { type: Object },

    // maigc boot
    image: { type: Schema.Types.ObjectId, ref: 'Images' }, // move to groups <OR> both ?
    groups: [{ type: Schema.Types.ObjectId, ref: 'Groups' }],
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Tasks' }],
    description: { type: String },
    hostname: { type: String, required: true },

    // timestamps
    timestamps: {
      created: { type: Number, default: (new Date().getTime()) },
      edited: { type: Number },
      deployed: { type: Number },
      updated: { type: Number }
    }

  });

  schema.pre('save', function (next) {

    // format mac
    this.mac = this.mac.replace(/-/g, ':');
    this.mac = this.mac.toUpperCase();

    // add updated timestamp here ?

    if (this.uuid) {
      this.uuid = this.uuid.toUpperCase();
    }

    // do stuff
    next();

  });

  // register model
  mongoose.model("Computer", schema);

})();


/**
 * Image schema/model
 * @returns {undefined}
 */
(function () {

  // create schema
  let schema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ["windows", "clonezilla"] },
    resource: { type: String, required: true },
    index: { type: Number, min: 1, max: 10 },
    description: { type: String }
  });

  schema.pre("save", function (next) {

    console.log("In images.pre(save) debug, check if saved when update computer.");
    next();

  });

  // register model
  mongoose.model("Images", schema);

})();


/**
 * Task schema/model
 * @returns {undefined}
 */
(function () {

  // create schema
  let schema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    options: { type: String, default: "{}" },
    command: { type: String, required: true },
    settings: {
      retry: { type: Boolean, default: false },
      attempts: { type: Number, default: 3 }
    }
  });

  // register model
  mongoose.model("Tasks", schema);

})();


/**
 * Group schema/model
 * @returns {undefined}
 */
(function () {

  // create schema
  let schema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Tasks' }]
    //image: {type: Schema.Types.ObjectId, ref: 'Images' }
    // attributes: [{
    //   name: {type: String, required: true},
    //   value: {type: String, required: true}
    // }]
  });

  // register model
  mongoose.model("Groups", schema);

})();

module.exports = mongoose;