#!/usr/bin/env node
/* Mark command line tool */
var helmsman = require('helmsman');

var cli = helmsman({prefix:'mark'});
console.log("Mark command line tool v0.1.0");
cli.parse();