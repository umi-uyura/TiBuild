/**
 * testflight.js
 */

"use strict";

var exec = require("child_process").exec,
    path = require("path"),
    fs = require("fs");

exports.takeoff = function(flightplan) {
  if (!flightplan.target) {
    flightplan.target = "device";
  }

  var request = "";
  if (flightplan.api_token) request += " -F api_token=\'" + flightplan.api_token + "\'";
  if (flightplan.team_token) request += " -F team_token=\'" + flightplan.team_token + "\'";
  if (flightplan.distribution_lists) request += " -F distribution_lists=\'" + flightplan.distribution_lists + "\'";
  if (flightplan.notify) request += " -F notify=True";
  if (flightplan.replace) request += " -F replace=True";

  if ("ios" === flightplan.platform) {
    var ios_path = "";
    if ("dist-adhoc" === flightplan.target) {
      ios_path = flightplan.output_dir;
    } else {
      ios_path = "build/iphone/build/";
      ios_path += /^simulator|device$/.test(flightplan.target) ? "Debug" : "Release";
      ios_path += "-";
      ios_path += "simulator" === flightplan.target ? "iphonesimulator" : "iphoneos";
      ios_path += "/";
    }
    request += " -F file=@" + path.join(ios_path, flightplan.appname + ".ipa");
  } else if ("android" === flightplan.platform) {
    if ("dist-playstore" === flightplan.target) {
      request += " -F file=@" + path.join(flightplan.output_dir, flightplan.appname + ".apk");
    } else {
      request += " -F file=@build/android/bin/app.apk";
    }
  }

  request += " -F notes=\'" + flightplan.notes + "\'";

  exec("curl http://testflightapp.com/api/builds.json " + request, function(err, stdout, stderr) {
    if (stderr) {
      console.log(stderr);
      console.log("");
    }

    console.log(stdout);
  });
};