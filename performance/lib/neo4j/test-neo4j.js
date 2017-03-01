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
const neo4j = require('neo4j-driver').v1;
const Enums = require('../enums');
const core = require('../test-core');

const host  = 'bolt://localhost';

/* Performance Benchmars Types */
var BenchmarkType = Enums.Test;

// Parameters for test
// const input = __dirname + '/../../data/directors-5000.csv';
const input = __dirname + '/../../data/films-50k.csv';


/**
 * Performance Benchmark implementation for Neo4j.
 * Includes the following test:
 * <ul>
 *     <li>Single Read Test.
 *     <li>Single Write Test.
 *     <li>Single Read and Write Test (50/50).
 *     <li>Neighbor Test.
 * </ul>
 */
class PerformanceBenchmarkNeo extends core {

    constructor(param = {}) {

        super(param);

        /* Initialize processed counter */
        this._nproc = 0;
        this._size = 0;
        this._ctrl = 0;
        /* Initialize Neo4j driver */
        this.init();

        /* Object Seal No-Jutsu ~(X)~ */
        // Object.seal(this);
    }


    /**
     * Initialize Neo4j driver connection.
     */
    init() {

        /* This instance object reference */
        let self = this;

        /* Create a driver instance. It should be enough to have a single driver per database per application. */
        self._driver = neo4j.driver(host, neo4j.auth.basic("neo4j", "trueno"));
        /* Register a callback to know if driver creation was successful: */
        self._driver.onCompleted = function() {
            /* proceed with using the driver, it was successfully instantiated */
            // console.log('Driver instantiation success');
            /* start test */
            self.doTest();
        };
        /* Register a callback to know if driver creation failed. */
        self._driver.onError = function(error) {
            console.log('Driver instantiation failed', error);
        };
        /* Create a session to run Cypher statements in. */
        self._session = self._driver.session();

    }

    /**
     * Override
     * Clean variables
     */
    clean() {
        this._nproc = 0;
        this._size = 0;
        this._ctrl = 0;
    }

    /**
     * Override.
     * Close Neo4j session.
     */
    close() {
        /* Close Neo4j driver session */
        this._session.close();
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
        /* CQL to extract films by name */
        // let query = "MATCH (f:Film) -[]-> () WHERE f.name = {name} RETURN f";
        let query = "MATCH (f:Film {filmId: {name}}) RETURN f";
        /* Parameters for CQL */
        let param = {name: film};
        /* Results */
        let result = this._session.run(query, param);

        return new Promise(() => {
            result
                .subscribe({
                    onNext: function(record) {
                        // console.log('[%d] ==> ', self._nproc, record._fields);
                        let control = Number(record._fields[0].properties.control);
                        self._nproc++
                        self._size += sizeof(record);
                        self._ctrl  = Math.round((self._ctrl + control) * 100000000) / 100000000;
                    },
                    onCompleted: function(metadata) {
                        // console.log('onCompleted: ', metadata);
                        resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                    },
                    onError: function(error) {
                        console.log('SingleRead [ERR] ==> ', error);
                        reject(error);
                    }

                });
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
    singleWriteTest(id, name, resolve, reject) {

        /* This instance object reference */
        let self = this;
        /* CQL to create a vertex */
        let query = "CREATE (a:Film {id:{id}, name:{name}, year:{year}, budget:{budget}})";
        /* Parameters for CQL */
        let param = {id:id, name:name, year:1999, budget:999};
        /* Results */
        let result = self._session.run(query, param);

        return new Promise(() => {
            result
                .then(record => {
                    // console.log(record);
                    self._size += sizeof(record);
                    self._nproc++
                    resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                })
                .catch(error => {
                    console.log('SingleWrite [ERR] ==> ', error);
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
        /* CQL to create a vertex */
        let query = "MATCH (f:Film {name: {name}}) SET f.budget = {value}  RETURN f"
        /* Parameters for CQL */
        let param = {name: film, value: 1};
        /* Results */
        let result = self._session.run(query, param);

        return new Promise(() => {
            result
                .then(record => {
                    // console.log(record);
                    self._size += sizeof(record);
                    self._nproc++
                    resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                })
                .catch(error => {
                    console.log('SingleReadWrite [ERR] ==> ', error);
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
        /* CQL to create a vertex */
        let query = "MATCH (f:Film) -[r:GENRE]-> (g:Genre) WHERE f.name = {name} RETURN g";
        /* Parameters for CQL */
        let param = {name: film};
        /* Results */
        let result = self._session.run(query, param);

        return new Promise(() => {
            result
                .subscribe({
                    onNext: function(record) {
                        // console.log('[%d] ==> ', self._nproc, record._fields);
                        self._size += sizeof(record);
                        self._nproc++
                    },
                    onCompleted: function(metadata) {
                        // console.log('onCompleted: ', metadata);
                        resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                    },
                    onError: function(error) {
                        console.log('Neighbors [ERR] ==> ', error);
                        reject(error);
                    }

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

        console.log('neo4j');

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
                self.repeatTestCase('Single Write', times);
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
module.exports = PerformanceBenchmarkNeo;


let t = new PerformanceBenchmarkNeo({input: input, type: BenchmarkType.SINGLE_READ});
// let t = new PerformanceBenchmarkNeo({input: input, type: BenchmarkType.SINGLE_WRITE});
// let t = new PerformanceBenchmarkNeo({input: input, type: BenchmarkType.SINGLE_READ_WRITE});
// let t = new PerformanceBenchmarkNeo({input: input, type: BenchmarkType.NEIGHBORS});

