"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */

/* import modules */
const Promise = require("bluebird");
const csv = require('csv-parser');
const fs = require('fs');

// Parameters for test
const input = __dirname + '/../../data/films-100k.csv';
const times = 10;


/** Performance Benchmark implementation */
class performanceBenchmark {


    array = [];

    /**
     * Create a template object.
     * @param {object} [param= {}] - Parameter with default value of object {}.
     */
    constructor(param = {}) {

        this._property = param.prop || 'someValue';
    }

    /*========================= HELPER FUNCTIONS =======================*/

    /**
     * Clean variables
     */
    clean() {
    }

    /**
     * Repeat a test case `n` times
     * @param {function} test - Test to repeat
     * @param {integer} n - Number of times the testcase is going to be repeated.
     */
    repeatTestCase(test, n) {
        for (let i=0; i<n; i++) {
            array.push(i);
        }

        doTestCase(test)
            .then(result => {
                session.close();
                console.log('done!');
            }, error => {
                console.log('repeatTestCase [ERR] =>', error);
            });
    }

    /**
     * Synchronous call of chain of `n` test case, by invoking the test case one by one; that means that a test case
     * must have finished to call the other.
     * @param test
     */
    doTestCase(test) {

        return new Promise((resolve, reject) => {
            test()
                .then(result => {
                    array.shift();
                    if (array.length > 0) {
                        clean();
                        return doTestCase(test).then(() => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                }, error => {
                    console.log('doTestCase [ERR] => ', error)
                    error();
                });
        });
    }

    /*======================== PERFORMANCE TESTS =======================*/

    /**
     * Single Reads.
     * The test consists on open an input file, and read a single vertex (and all its properties) by accessing the vertex
     * using an index.
     */
    executeTest(test) {

        let self = this;
        let keys = [];
        let promiseArray = [];

        let hrstart, hrend;

        return new Promise((resolve, reject) => {

            fs.createReadStream(input)
                .pipe(csv({separator: ','}))
                .on('data', function(data) {
                    // console.log('-->', data.name);
                    names.push(data.name);
                })
                .on('end', function() {
                    // console.log('----> end');
                    hrstart = process.hrtime();

                    for (let k in keys) {
                        promiseArray.push(
                            new Promise((resolve, reject) => {
                                /* execute specific test */
                                test(keys[k], resolve, reject);
                            })
                        )
                    }

                    Promise.all(promiseArray).then(() => {
                        hrend = process.hrtime(hrstart);
                        console.log('Single Reads\t%ds %dms\t%d records\t%d records/s',
                            hrend[0], hrend[1]/1000000, nproc[0], nproc[0]/(hrend[0][0] + hrend[1]/1000000000));
                        resolve();
                    });
                })
        });

    }


}


/* exporting the module */
module.exports = performanceBenchmark;