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
const core = require('../test-core');
const fs = require('fs');

const dbName = 'movies';
// const dbName = 'benchmark';
const host  = 'http://localhost';

var counter =0;
var limit = 100000000;

/* input for test1 */
const input = __dirname + '/../../data/films-10k.csv';


// let hrstart = [];
// let hrend = [];
// let nproc = [];
// let ncontrol;
//

// function debug100(index) {
//     let jmp = 100;
//     if (nproc[index] > ncontrol) {
//         console.log('%d records', nproc[index])
//         ncontrol += jmp;
//     }
// }
//
// // get a director by its name
// function getDirector(director, resolve, reject) {
//
//     let filter = g.filter()
//         .term('prop.name', director);
//
//     return new Promise(() => {
//         if(++counter <= limit){
//             g.fetch('v', filter)
//                 .then(result => {
//                     //console.log(result);
//                     nproc[0]++;
//                     resolve();
//                 })
//                 .catch(error => {
//                     console.log('ERR ==> ', error);
//                     reject();
//                 });
//          }
//     });
//
// }
//
// // set a director
// function setDirectorbyId(directorId, directorName, resolve, reject) {
//
//     let v = g.addVertex();
//
//     v.setId(directorId);
//     v.setLabel('Person');
//     v.setProperty('name', directorName);
//     v.setProperty('city', 'Somewhere');
//     v.setProperty('age', 99);
//
//     return new Promise(() => {
//         v.persist()
//             .then(values => {
//                 nproc[1]++;
//                 resolve();
//                 // console.log('persist');
//             })
//             .catch(error => {
//                 console.log('ERR ==> [%s] [%d] processed', directorId, nproc[1]);
//                 console.log('ERR ==> ', error);
//                 reject();
//             });
//     });
//
// }
//
// // set a director by its name
// function setDirectorbyName(director, resolve, reject) {
//
//     let promises = [];
//     let filter = g.filter()
//         .term('prop.name', director);
//
//     return new Promise(() => {
//         g.fetch('v', filter)
//             .then(results => {
//                 results.forEach(v => {
//                     v.setProperty('age', 1);
//
//                     promises.push(
//                         new Promise((resolve, reject) => {
//                             /* Persist Changes */
//                             v.persist()
//                                 .then(result => {
//                                     // console.log('persist');
//                                     nproc[2]++;
//                                     resolve();
//                                 }, error => {
//                                     console.log('ERR ==> [%s]', director);
//                                     console.log('ERR ==> ', error);
//                                     reject()
//                                 });
//                         })
//                     );
//
//                 });
//
//                 Promise.all(promises)
//                     .then(() => {
//                         resolve();
//                     });
//
//             }, error => {
//                 console.log('ERR ==> [%s] [%d] processed', director, nproc[2]);
//                 console.log('ERR ==> ', error);
//                 reject();
//             });
//     });
//
// }
//
// // get all the films of a director
// function getFilms(director, resolve, reject) {
//
//     let filter = g.filter()
//         .term('prop.name', director);
//
//     return new Promise(() => {
//         g.fetch('v', filter)
//             .then(results => {
//                 results.forEach(v => {
//                     v.out('v')
//                         .then(vertices => {
//                             nproc[2]++;
//                             resolve();
//                             // console.log('then');
//                         })
//                         .catch(error => {
//                             console.log('ERR ==> ', error);
//                             reject();
//                         });
//                 })
//             }, error => {
//                 console.log('ERR ==> [%s] [%d] processed', director, nproc[1]);
//                 console.log('ERR ==> ', error);
//                 reject();
//             });
//     });
// }

// /**
//  * Single Reads.
//  * The test consists on open an input file, and read a single vertex (and all its properties) by accessing the vertex
//  * using an index.
//  */
// function singleReads() {
//
//     let self = this;
//     let directors = [];
//     let promiseArray = [];
//
//     return new Promise((resolve, reject) => {
//
//         fs.createReadStream(input)
//             .pipe(csv({separator: ','}))
//             .on('data', function(data) {
//                 // console.log('-->', data.name);
//                 directors.push(data.name);
//             })
//             .on('end', function() {
//                 console.log('----> end');
//
//                 hrstart[0] = process.hrtime();
//
//                 for (let k in directors) {
//                     promiseArray.push(
//                         new Promise((resolve, reject) => {
//                             /* Retrieve films */
//                             getDirector(directors[k], resolve, reject);
//                         })
//                     )
//                 }
//
//                 Promise.all(promiseArray).then(() => {
//                     hrend[0] = process.hrtime(hrstart[0]);
//                     console.log('Single Reads\t%ds %dms\t%d records\t%d records/s',
//                         hrend[0][0], hrend[0][1]/1000000, nproc[0], nproc[0]/(hrend[0][0] + hrend[0][1]/1000000000));
//                     trueno.disconnect();
//                     resolve();
//                 });
//             })
//     })
//
// }
//
// /**
//  * Single Writes
//  * The test consists on open an input file, and create a vertex using the input data.
//  */
// function singleWrites() {
//
//     let self = this;
//     let directors = [];
//     let promiseArray = [];
//
//     return new Promise((resolve, reject) => {
//
//         fs.createReadStream(input)
//             .pipe(csv({separator: ','}))
//             .on('data', function(data) {
//                 // console.log('-->', data.name);
//                 directors.push(data.name);
//             })
//             .on('end', function() {
//                 console.log('----> end');
//
//                 hrstart[1] = process.hrtime();
//
//                 for (let k=0; k < directors.length; k++) {
//                     promiseArray.push(
//                         new Promise((resolve, reject) => {
//                             /* Retrieve films */
//                             setDirectorbyId(k, directors[k], resolve, reject);
//                         })
//                     );
//                 }
//
//                 Promise.all(promiseArray).then(() => {
//                     hrend[1] = process.hrtime(hrstart[1]);
//                     console.log('Single Writes\t%ds %dms\t%d records\t%d records/s',
//                         hrend[1][0], hrend[1][1]/1000000, nproc[1], nproc[1]/(hrend[1][0] + hrend[1][1]/1000000000));
//                     trueno.disconnect();
//                     resolve();
//                 });
//             })
//     })
// }
//
// /**
//  * Reads/Writes (50/50 load)
//  * The test consists on read an input file, and retrieve a vertex and update the properties of that vertex.
//  */
// function singleReadWrites() {
//
//     let self = this;
//     let directors = [];
//     let promiseArray = [];
//
//     return new Promise((resolve, reject) => {
//
//         fs.createReadStream(input)
//             .pipe(csv({separator: ','}))
//             .on('data', function(data) {
//                 // console.log('-->', data.name);
//                 directors.push(data.name);
//             })
//             .on('end', function() {
//                 console.log('----> end');
//
//                 hrstart[1] = process.hrtime();
//
//                 for (let k in directors) {
//                     // console.log('--> directors: ',directors[k]);
//                     promiseArray.push(
//                         new Promise((resolve, reject) => {
//                             /* Retrieve films */
//                             setDirectorbyName(directors[k], resolve, reject);
//                         })
//                     )
//                 }
//
//                 Promise.all(promiseArray).then(() => {
//                     hrend[2] = process.hrtime(hrstart[2]);
//                     console.log('Single Read+Writes\t%ds %dms\t%d records\t%d records/s',
//                         hrend[2][0], hrend[2][1]/1000000, nproc[2], nproc[2]/(hrend[2][0] + hrend[2][1]/1000000000));
//                     trueno.disconnect();
//                     resolve();
//                 });
//             })
//     })
// }
//
// /**
//  * Neighbors (1 hop)
//  * The test consists on read an input file, and ask for all the direct neighbors of a vertex.
//  */
// function neighbors() {
//
//     let self = this;
//     let directors = [];
//     let promiseArray = [];
//
//     let hrstart = process.hrtime();
//
//     return new Promise((resolve, reject) => {
//
//         fs.createReadStream(input)
//             .pipe(csv({separator: ','}))
//             .on('data', function(data) {
//                 // console.log('-->', data.name);
//                 directors.push(data.name);
//             })
//             .on('end', function() {
//                 // console.log('----> end');
//
//                 hrstart[2] = process.hrtime();
//                 for (let k in directors) {
//                     promiseArray.push(
//                         new Promise((resolve, reject) => {
//                             /* Retrieve films */
//                             getFilms(directors[k], resolve, reject);
//                         })
//                     )
//                 }
//
//                 Promise.all(promiseArray).then(() => {
//                     hrend[3] = process.hrtime(hrstart[3]);
//                     console.log('Neighbors\t%ds %dms\t%d records\t%d records/s',
//                         hrend[3][0], hrend[3][1]/1000000, nproc[3], nproc[3]/(hrend[3][0] + hrend[3][1]/1000000000));
//                     trueno.disconnect();
//                     resolve(hrend - hrstart);
//                 });
//             })
//     })
//
// }


// function doTest() {
//
//     console.log('Trueno');
//     console.log('doTest');
//
//     /* init */
//     ncontrol = 0;
//     nproc[0] = 0;
//     nproc[1] = 0;
//     nproc[2] = 0;
//
//     /* single reading */
//     // singleReads();
//
//     /* single writing */
//     singleWrites();
//
//     /* single reading/writing */
//     // singleReadWrites();
//
//     /* neighbors reading */
//     // neighbors();
//
// }


// trueno.connect(s => {
//
//     /* Create Graph instance */
//     g = trueno.Graph();
//     g.setLabel(dbName);
//
//     /* Open trueno database instance */
//     g.open().then( (result) => {
//         /* execute test cases */
//         doTest();
//     });
//
// }, s => {
//     console.log('disconnected: ', dbName);
// });

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
        this._nproc = 0;
        this._size = 0;
        this._counter=0;
        /* Instantiate Trueno connection */
        this._trueno = new Trueno({host: host, port: 8000, debug: false});
        /* Initialize Trueno driver */
        this.init();

        console.log('constructor!');

        /* Object Seal No-Jutsu ~(X)~ */
        // Object.seal(this);
    }


    /**
     * Initialize Trueno driver connection.
     */
    init() {

        /* This instance object reference */
        let self = this;

        console.log('init__<');

        /* Create Graph instance */
        self._g = self._trueno.Graph();
        self._g.setLabel(dbName);
        /* Establish a Trueno connection and register callbacks */
        self._trueno
            .connect(s => {

                console.log('connect!!!');

                /* Open trueno database instance */
                self._g.open()
                    .then((result) => {

                        console.log('open --> ', dbName);

                        /* execute test cases */
                        self.doTest();
                    });

        }, s => {
            console.log('disconnected [%s] ==> ', dbName, s);
            process.exit();
        });
    }

    /**
     * Override
     * Clean variables
     */
    clean() {
        this._size = 0;
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
            .term('prop.name', film);
        /* Results */
        let result = self._g.fetch('v', filter);

        return new Promise(() => {

            if (self._counter % 100 == 0) console.log('--> %d ** %d <-- %d <--> %s', self._nproc, self._counter, limit, film);

            if (++self._counter <= limit) {

                // console.log('if <---', self._nproc);

                result
                    .then(result => {
                        // console.log('[%d] ==> ', self._nproc, result);
                        if (self._nproc % 100 == 0) console.log('[%d] ==> ', self._nproc, self._counter);
                        self._nproc++;
                        self._size += sizeof(result);
                        resolve({nproc: self._nproc, size: self._size});
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
                    resolve({nproc: self._nproc, size: self._size});
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
                                        resolve({nproc: self._nproc, size: self._size});
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
                            resolve({nproc: 0, size: 0});
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
                                resolve({nproc: self._nproc, size: self._size});
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
        let times = 5;

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
module.exports = performanceBenchmarkTrueno;

let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_READ});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_WRITE});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_READ_WRITE});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.NEIGHBORS});
