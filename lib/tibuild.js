/**
 * TiBuild
 */

"use strict";

var CONFIGURATION_NAME = "tibuild.json";

var _ = require("underscore"),
    exec = require("child_process").exec,
    path = require("path"),
    fs = require("fs"),
    testflight = require("./testflight"),
    appinfo = require("../package.json");

var optimist = require("optimist")
      .usage(appinfo.description + "\n"
             + "\n"
             + "Usage: tibuild [<titanium_cli_options>] [options]")
      .alias("h", "help")
      .alias("v", "version")
      .alias("p", "platform")
      .alias("T", "target")
      .describe("flight", "upload to TestFlight after build")
      .describe("shadow", "run TiShadow (not implemented yet!!!)");
//       .describe("dev", "enable trace log");

var argv = optimist.parse(process.argv);
var debug = argv.dev;

if (3 > process.argv.length || argv.h) {
  optimist.showHelp();
  process.exit(0);
}

if (argv.v) {
  console.log(appinfo.version);
  process.exit(0);
}

var opts = _.omit(argv, ["_", "$0", "dev"]);

if (debug) console.log(opts);

if ("iphone" === opts.platform || "ipad" === opts.platform) {
  opts.platform = "ios";
}

//
// Configuration
//

//var baseconf = path.join(process.env["HOME"], "tibuild.json");
var projconf_path = path.resolve(CONFIGURATION_NAME);
// console.log(projconf_path);
if (!fs.existsSync(projconf_path)) {
  console.log("ERROR: configuration file not found.");
  process.exit(0);
}

var projconf = require(projconf_path);
var conf = _.clone(projconf);

if (debug) console.log(conf);

//
// Options
//

_.extend(opts, conf.options);

if (opts.flight) {
  if (!opts.target || /simulator|emulator/.test(opts.target)) {
    console.log("WARNING: '--flight' option is not usable when target is 'simulator' or 'emulator'.");
    console.log("WARNING: change target to 'device'.");
    opts.target = "device";
    opts.T = "device";
  } else if ("ios" === opts.platform && "dist-appstore" === opts.target) {
    console.log("ERROR: 'dist-appstore' cannot testflight. use 'device' or 'dist-adhoc'.");
    process.exit(0);
  }
}

if ("ios" === opts.platform) {
  _.extend(opts, conf.ios.options);
  if (!opts.target || "simulator" === opts.target) {
    switch (conf.ios.simulator) {
    case "retina":
      opts.retina = true;
      break;
    case "tall":
      opts.retina = true;
      opts.tall = true;
      break;
    }
  } else if (/device|dist-appstore|dist-adhoc/.test(opts.target)) {
    switch (opts.target) {
    case "device":
      if (conf.ios.developer.pp_uuid) opts.P = conf.ios.developer.pp_uuid;
      if (conf.ios.developer.name) opts.V = "\'" + conf.ios.developer.name + "\'";
      break;
    case "dist-appstore":
      if (conf.ios.distribution.pp_uuid) opts.P = conf.ios.distribution.pp_uuid;
      if (conf.ios.distribution.name) opts.R = "\'" + conf.ios.distribution.name + "\'";
      break;
    case "dist-adhoc":
      if (conf.ios.adhoc.pp_uuid) opts.P = conf.ios.adhoc.pp_uuid;
      if (conf.ios.adhoc.name) opts.R = "\'" + conf.ios.adhoc.name + "\'";
      if (conf.ios.adhoc.output_dir) opts.O = "\'" + conf.ios.adhoc.output_dir + "\'";
      break;
    }
  }
} else if ("android" === opts.platform) {
  _.extend(opts, conf.android.options);
  
  if ("dist-playstore" === opts.target) {
    if (conf.android.distribution.keystore) opts.K = "\'" + conf.android.distribution.keystore + "\'";
    if (conf.android.distribution.alias) opts.L = "\'" + conf.android.distribution.alias + "\'";
    if (conf.android.distribution.password) opts.P = "\'" + conf.android.distribution.password + "\'";
    if (conf.android.distribution.output_dir) opts.O = "\'" + conf.android.distribution.output_dir + "\'";
  }
}

opts.after = {};

if (opts.flight) {
  opts.after.testflight = {};
  _.extend(opts.after.testflight, conf.testflight);
  
  opts.after.testflight.platform = opts.platform;
  opts.after.testflight.target = opts.target;

  if ("ios" === opts.platform && "dist-adhoc" === opts.target) {
    opts.after.testflight.output_dir = conf.ios.adhoc.output_dir;
  } else if ("android" === opts.platform && "dist-playstore" === opts.target) {
    opts.after.testflight.output_dir = conf.android.distribution.output_dir;
  }

  if ("string" === typeof opts.flight) {
    opts.after.testflight.notes = opts.flight;
  } else {
    opts.after.testflight.notes = "Build upload from TiBuild.";
  }

  delete opts.flight;

  // ios ... --build-only not generate .ipa
  // android & dist-playstore ... distribution .ipa not generate. generate app.ipa.
  if ("android" === opts.platform && "dist-playstore" !== opts.target) {
    console.log("INFO: enable '--build-only', because '--flight' option use.");
    opts.b = true;
  }
} else if (opts.shadow) {
  opts.after.tishadow = opts.shadow;
  delete opts.shadow;
}

// delete duplicate alias key
if (opts.platform) delete opts.platform;
if (opts.target) delete opts.target;

var options = "";
_.each(opts, function(value, key) {
  if ("after" === key) {
    return;
  }

  if (debug) console.log(key + " : " + value + " / " + typeof value);
  
  var k = (1 === key.length) ? "-" + key : "--" + key;
  var v = ("boolean" === typeof value)
  var arg = k + (("boolean" === typeof value) ? "" : " " + value);

  options += " " + arg;
});

//
// building
//

if (debug) console.log("tibuild " + options);
exec("ti build " + options, function(err, stdout, stderr) {
  if (stderr) {
    console.log(stderr);
    console.log("");
  }

  console.log(stdout);

  if (opts.after.testflight) {
    testflight.takeoff(opts.after.testflight);
  } else if (opts.after.tishadow) {
    console.log("TiShadow Run!!!");
  }
});
