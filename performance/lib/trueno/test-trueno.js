"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */

/* import modules */
const Promise = require("bluebird");
const sizeof = require('sizeof').sizeof;
const Trueno = require('trueno-javascript-driver');
const Enums = require('../enums');
const core = require('../test-core');
const fs = require('fs');

const dbName = 'films';
// const dbName = 'benchmark';
const host  = 'http://localhost';

/* Performance Benchmars Types */
var BenchmarkType = Enums.Test;

// Parameters for test
/* input for test1 */
const input = __dirname + '/../../data/films-10k.csv';

var limit = 100000000;

/**
 * Performance Benchmark implementation for Trueno.
 * Includes the following test:
 * <ul>
 *     <li>Single Read Test.
 *     <li>Single Write Test.
 *     <li>Single Read and Write Test (50/50).
 *     <li>Neighbor Test.
 * </ul>
 */
class PerformanceBenchmarkTrueno extends core {

    constructor(param = {}) {

        super(param);

        /* Initialize processed counter */
        this._ctrl = 0;
        this._size = 0;
        this._nproc = 0;
        this._counter = 0;
        /* Instantiate Trueno connection */
        this._trueno = new Trueno({host: host, port: 8000, debug: false});
        /* Initialize Trueno driver */
        this.init();

        /* Object Seal No-Jutsu ~(X)~ */
        // Object.seal(this);
    }


    /**
     * Initialize Trueno driver connection.
     */
    init() {

        /* This instance object reference */
        let self = this;

        /* Create Graph instance */
        self._g = self._trueno.Graph();
        self._g.setLabel(dbName);
        /* Establish a Trueno connection and register callbacks */
        self._trueno
            .connect(s => {
                /* Open trueno database instance */
                self._g.open()
                    .then((result) => {
                        /* execute test cases */
                        self.doTest();
                    });
        }, s => {
            console.log('disconnected from [%s]', dbName);
            process.exit();
        });
    }

    /**
     * Override
     * Clean variables
     */
    clean() {
        this._size = 0;
        this._ctrl = 0;
        this._nproc = 0;
        this._counter = 0;
    }

    /**
     * Override.
     * Close Trueno session.
     */
    close() {
        /* Disconnect Trueno session */
        this._trueno.disconnect();
    }

    /*======================= BENCHMARK TESTCASES ======================*/

    /*
     * Function used to access data from the graph storage.
     * The functions use specific features of the graph db API.
     */

    /**
     * Single Reads.
     * The test consists on open an input file, and read a single vertex (and all its properties) by accessing the vertex
     * using an index.
     * @param film
     * @param resolve
     * @param reject
     */
    singleReadTest(id, film, resolve, reject) {

        /* This instance object reference */
        let self = this;
        /* Set filter for vertices */
        let filter = self._g.filter()
            .term('prop.filmId', film)
            // .match('label', 'Film');
        /* Results */
        let result = self._g.fetch('v', filter);

        return new Promise(() => {

            // if (self._counter % 100 == 0) console.log('--> %d ** %d <-- %d <--> %s', self._nproc, self._counter, limit, film);

            if (++self._counter <= limit) {
                result
                    .then(result => {
                        // console.log('[%d] ==> ', self._nproc, result);
                        for (let k in result) {
                            let control = Number(result[k].getProperty('control')) || 0;
                            self._ctrl  = Math.round((self._ctrl + control) * 100000000) / 100000000;
                            // console.log('[%d] ==> ', self._nproc, control, self._ctrl, result[k]);
                        }
                        // result.forEach(v => {
                        //     let control = v.getProperty('control');
                        //     self._ctrl  = Math.round((self._ctrl + control) * 100000000) / 100000000;
                        // });

                        // if (self._nproc % 100 == 0) console.log('[%d] ==> ', self._nproc, self._counter);
                        self._nproc++;
                        self._size += sizeof(result);
                        resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                    })
                    .catch(error => {
                        console.log('ERR ==> ', error);
                        reject(error);
                    });
            } else {
                resolve({nproc: self._nproc, size: self._size})
            }
        });
    }

    /**
     * Single Writes
     * The test consists on open an input file, and create a vertex using the input data.
     * @param id
     * @param name
     * @param resolve
     * @param reject
     */
    singleWriteTest(id, film, resolve, reject) {

        /* This instance object reference */
        let self = this;
        /* Vertex to add to the graph */
        let v = self._g.addVertex();

        /* Set attributes */
        v.setId(id);
        v.setLabel('Film');
        v.setProperty('name', film);
        v.setProperty('year', 1999);
        v.setProperty('budget', 99);

        /* Results */
        let result = v.persist();

        return new Promise(() => {
            result
                .then(values => {
                    // console.log('persist');
                    self._nproc++;
                    self._size += sizeof(result);
                    resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                })
                .catch(error => {
                    console.log('ERR ==> [%s] [%d] processed', id, self._nproc);
                    console.log('ERR ==> ', error);
                    reject(error);
                });
        });

    }


    /**
     * Reads/Writes (50/50 load)
     * The test consists on read an input file, and retrieve a vertex and update the properties of that vertex.
     * @param id
     * @param film
     * @param resolve
     * @param reject
     */
    singleReadWriteTest(id, film, resolve, reject) {

        /* This instance object reference */
        let self = this;
        /* Collection of promises to read */
        let promises = [];
        /* Set filter for vertices */
        let filter = self._g.filter()
            .term('prop.name', film);
        /* Results */
        let result = self._g.fetch('v', filter);

        return new Promise(() => {
            result
                .then(results => {
                    results.forEach(v => {
                        v.setProperty('budget', 1);

                        promises.push(
                            new Promise((resolve, reject) => {
                                /* Persist Changes */
                                v.persist()
                                    .then(result => {
                                        // console.log('persist');
                                        self._nproc++;
                                        self._size += sizeof(result)+sizeof(v);
                                        resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                                    }, error => {
                                        console.log('ERR ==> [%s]', director);
                                        console.log('ERR ==> ', error);
                                        reject(error)
                                    });
                            })
                        );

                    });

                    Promise.all(promises)
                        .then(() => {
                            //TODO Solve correctly the promises
                            resolve({nproc: 0, size: 0, ctrl: 0});
                        });

                }, error => {
                    console.log('ERR ==> [%s] [%d] processed', director, nproc[2]);
                    console.log('ERR ==> ', error);
                    reject(error);
                });
        });

    }

    /**
     * Neighbors (1 hop)
     * The test consists on read an input file, and ask for all the direct neighbors of a vertex.
     * @param id
     * @param film
     * @param resolve
     * @param reject
     */
    neighborsTest(id, film, resolve, reject) {

        /* This instance object reference */
        let self = this;
        /* Set filter for vertices */
        let filter = self._g.filter()
            .term('prop.name', director);
        /* Results */
        let result = self._g.fetch('v', filter);

        return new Promise(() => {
            result
                .then(results => {
                    results.forEach(v => {
                        v.out('v')
                            .then(vertices => {
                                self._nproc++;
                                self._size += sizeof(vertices)+sizeof(v);
                                resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                            })
                            .catch(error => {
                                console.log('ERR ==> ', error);
                                reject(error);
                            });
                    })
                }, error => {
                    console.log('ERR ==> [%s] [%d] processed', director, nproc[1]);
                    console.log('ERR ==> ', error);
                    reject();
                });
        });
    }

    /**
     * Execute Test
     */
    doTest() {

        /* This instance object reference */
        let self = this;
        /* Times to repeat a testcase */
        let times = 3;

        console.log('trueno');

        switch (self._type) {

            /* Neighbors */
            case BenchmarkType.NEIGHBORS:
                self.test = self.neighborsTest;
                self.repeatTestCase('Neighbors', times);
                break;

            /* Single Read + Write */
            case BenchmarkType.SINGLE_READ_WRITE:
                self.test = self.singleReadWriteTest;
                self.repeatTestCase('Single Reads + Write', times);
                break;

            /* Single Write */
            case BenchmarkType.SINGLE_WRITE:
                self.test = self.singleWriteTest;
                self.repeatTestCase('Single Writes', times);
                break;

            /* Single Read */
            default:
            case BenchmarkType.SINGLE_READ:
                self.test = self.singleReadTest;
                self.repeatTestCase('Single Reads', times);
                break;
        }
    }

}

/* exporting the module */
module.exports = PerformanceBenchmarkTrueno;

let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_READ});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_WRITE});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_READ_WRITE});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.NEIGHBORS});
