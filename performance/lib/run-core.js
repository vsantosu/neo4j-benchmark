"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * Entry point of CLI. This execute all available performance benchmark testcases.
 *
 * @module lib/run-core
 * @see performance:lib/run
 */

let trueno = require('./trueno/test-trueno');
let neo4j = require('./neo4j/test-neo4j');


/**
 * Convert a string of items separated by ',' (coma) in an array
 * @param val {String}  the string to be convert
 * @returns {void|Array|*}
 */
function list(val) {
    return val.split(',');
}

module.exports.list = list;


/**
 * Launch Neo4j performance benchmark tests.
 *
 * @param dbname {String} Database name.
 * @param input {String}  Input filename.
 * @param write {String}  Input filename used for read/write (90/10) load testcase.
 * @param type {int}      Type of benchmark to be execute.
 * @param output {String} Outpul filename (summary).
 */
function launchNeo4j(dbname, input, write, type, output) {
    new neo4j(
        {   platform: "neo4j",
            dbName:   dbname,
            input:    input,
            indices:  write,
            type:     type,
            output:   output
        });
}


/**
 * Launch Trueno performance benchmark tests.
 *
 * @param dbname {String} Database name.
 * @param input {String}  Input filename.
 * @param write {String}  Input filename used for read/write (90/10) load testcase.
 * @param type {int}      Type of benchmark to be execute.
 * @param output {String} Output filename (summary).
 */
function launchTrueno(dbname, input, write, type, output) {

    try {
        new trueno(
            {   platform: "trueno",
                dbName:   dbname,
                input:    input,
                indices:  write,
                type:     type,
                output:   output
            });
    } catch (err) {
        console.log(err.message);
        process.exit();
    }

}

function launch(platform, dbname, input, write, type, output) {

    switch(platform) {
        case 'neo4j':
            launchNeo4j(dbname, input, write, type, output);
            break;

        case 'trueno':
            launchTrueno(dbname, input, write, type, output);
            break;

        default:
            console.log('both');
            break;
    }

}

module.exports.launch = launch;
