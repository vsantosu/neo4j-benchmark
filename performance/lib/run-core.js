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
 * Launch Neo4j performance benchmark tests.
 *
 * @param dbname {String} Database name.
 * @param input {String}  Input filename.
 * @param write {String}  Input filename used for read/write (90/10) load testcase.
 * @param type {int}      Type of benchmark to be execute.
 */
function launchNeo4j(dbname, input, write, type) {
    new neo4j(
        {   dbName:  dbname,
            input:   input,
            indices: write,
            type:    type });
}


/**
 * Launch Trueno performance benchmark tests.
 *
 * @param dbname {String} Database name.
 * @param input {String}  Input filename.
 * @param write {String}  Input filename used for read/write (90/10) load testcase.
 * @param type {int}      Type of benchmark to be execute.
 */
function launchTrueno(dbname, input, write, type) {
    new trueno(
        {   dbName:  dbname,
            input:   input,
            indices: write,
            type:    type });
}

function launch(platform, dbname, input, write, type) {

    switch(platform) {
        case 'neo4j':
            launchNeo4j(dbname, input, write, type);
            break;

        case 'trueno':
            launchTrueno(dbname, input, write, type);
            break;

        default:
            console.log('both');
            break;
    }

}

module.exports.launch = launch;
