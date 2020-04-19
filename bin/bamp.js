#!/usr/bin/env node

'use strict';

var Version = require('../lib/version'),
    CLI = require('../lib/cli');

var cli = new CLI(process.argv, process.cwd());

if (!cli.argv.major && !cli.argv.minor && !cli.argv.patch && !cli.argv.build) {
    cli.showHelp();
    process.exit();
}

cli.bump()
.catch(function (err) {
    console.error(err.stack || err.message || err);
    process.exit(1);
});