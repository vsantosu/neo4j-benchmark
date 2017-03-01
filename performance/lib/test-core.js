"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */

/* import modules */
const Promise = require("bluebird");
const Enums = require('./enums');
const csv = require('csv-parser');
const fs = require('fs');

// Parameters for test
const DEFAULT_INPUT = __dirname + '/../../data/films-10k.csv';
const times = 10;

/* Performance Benchmars Types */
var BenchmarkType = Enums.Test;


/**
 * Performance Benchmark Core class
 */
class PerformanceBenchmarkCore {


    /**
     * Create a template object.
     * @param {object} [param= {}] - Parameter with default value of object {}.
     */
    constructor(param = {}) {

        /* Input data file */
        this._input = param.input || DEFAULT_INPUT;
        /* Benchmark test to execute */
        this._type = param.type || BenchmarkType.SINGLE_READ;
        /* Controls the execution of the testcase */
        this._control = [];

        this._proc = 0;
        this._time = 0;
    }

    /*========================= HELPER FUNCTIONS =======================*/

    /**
     * Clean variables
     */
    clean() {
    }

    /**
     * Close session
     */
    close() {
    }

    test() {
    }

    /**
     * Repeat a test case `n` times
     * @param {function} test - Test to repeat
     * @param {integer} n - Number of times the testcase is going to be repeated
     */
    repeatTestCase(test, n) {

        /* This instance object reference */
        let self = this;

        for (let i=0; i<n; i++) {
            self._control.push(i);
        }

        self.doTestCase(test)
            .then(result => {
                console.log('\t avg: %d', self._proc/self._time)
                console.log('done!');
                /* close session */
                self.close();
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

        /* This instance object reference */
        let self = this;

        return new Promise((resolve, reject) => {
            self.testWrapper(test)
                .then(result => {
                    /* Move to next call in the queue */
                    self._control.shift();
                    /* Accumulate stats */
                    self._proc += result.processed;
                    self._time += result.time;
                    /* Check if there are more calls enqueued */
                    if (self._control.length > 0) {
                        self.clean();
                        return self.doTestCase(test).then((result) => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                }, error => {
                    console.log('doTestCase [ERR] => ', error)
                    reject(error);
                });
        });
    }

    /*======================== PERFORMANCE TESTS =======================*/

    /**
     * Test wrapper.
     * @param {String} label - Label of test to be executed.
     */
    testWrapper(label) {

        /* This instance object reference */
        let self = this;
        /* Keys retrieved from the input file */
        let keys = [];
        /* Promises collection of graph db driver call */
        let promiseArray = [];
        /* Start, end time of processing */
        let hrstart, hrend;
        /* Total of records processed */
        let total=0, size=0, ctrl=0;

        return new Promise((resolve, reject) => {

            let column;
            fs.createReadStream(self._input)
                .pipe(csv({separator: ','}))
                .on('headers', function (headerList) {
                    column = headerList[0]
                })
                .on('data', function(data) {
                    // console.log('-->', data[column]);
                    keys.push(data[column]);
                })
                .on('end', function() {
                    hrstart = process.hrtime();

                    for (let k in keys) {
                        promiseArray.push(
                            new Promise((resolve, reject) => {
                                /* execute specific test */
                                self.test(k, keys[k], resolve, reject);
                            })
                        )
                    }

                    Promise.all(promiseArray)
                        .then(count => {
                            hrend = process.hrtime(hrstart);
                            total = count[count.length-1].nproc;
                            size = count[count.length-1].size;
                            ctrl = count[count.length-1].ctrl;

                            /* Print output */
                            console.log(
                                '%s\t%ds %dms\t%d records\t%d records/s\t%d bytes\t%d bytes/call\t%d bytes/s\t%d',
                                label, hrend[0], hrend[1]/1000000,
                                total, total/(hrend[0] + hrend[1]/1000000000),
                                size, size/total, size/(hrend[0] + hrend[1]/1000000000),
                                ctrl);
                            resolve({processed: total, time: hrend[0] + hrend[1]/1000000000});
                        })
                        .catch(error => {
                            console.log('Error while executing ... ', label);
                            reject(error);
                        });
                })
        });

    }


}


/* exporting the module */
module.exports = PerformanceBenchmarkCore;
