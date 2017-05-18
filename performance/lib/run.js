"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * Entry point of CLI. This execute all available performance benchmark testcases.
 *
 * @module lib/run
 * @see performance:lib/test-core
 */

let cli = require('commander');
let pkg = require('../../package.json');


cli.version(pkg.version)
    .command('read       [options]', 'Launch single read benchmark')
    .command('write      [options]', 'Launch single write benchmark')
    .command('mix        [options]', 'Launch read/write (10/90) load benchmark')
    .parse(process.argv);
