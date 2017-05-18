"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * Entry point of CLI. This execute all available performance benchmark testcases.
 *
 * @module lib/run-read
 * @see performance:lib/run
 */

const cli = require('commander');
const Enums = require('./enums');
const utils = require('./run-core');
const pkg = require('../../package.json');

/* Performance Benchmars Types */
let BenchmarkType = Enums.Test;


cli._name = "$ run read";
cli.version(pkg.version)
    .option('-p, --platform <string>', 'Set platform to use for test (eg. Neo4j, Trueno)')
    .option('-d, --dbname <string>', 'Set database')
    .option('-i, --input <string>',  'Set input file')
    .option('-w, --write <string>',  'Set input file used for read/write (90/10) benchmark')
    .parse(process.argv);

if ( !cli.write ) {
    console.log('--write required for read/write (90/10) test');
    process.exit();
}

console.log('Launching read/write load (90/10) test ...');

utils.launch(cli.platform, cli.dbname, cli.input, cli.write, BenchmarkType.SINGLE_READ_WRITE);


