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
const core = require('./run-core');
const pkg = require('../../package.json');

/* Performance Benchmars Types */
let BenchmarkType = Enums.Test;


cli._name = "$ run read";
cli.version(pkg.version)
    .option('-p, --platform <string>', 'Set platform to use for test (eg. Neo4j, Trueno)')
    .option('-d, --dbname <string>', 'Set database')
    .option('-i, --input <items>',  'Set input file', core.list)
    .option('-o, --output <string>', 'Set output file')
    .parse(process.argv);

console.log('Launching single read test ...');

core.launch(cli.platform, cli.dbname, cli.input, cli.write, BenchmarkType.SINGLE_READ, cli.output);

