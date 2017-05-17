"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * Performance benchmarks test suite for Neo4j.
 *
 * @module lib/neo4j/test-neo4j
 * @see performance:lib/test-core
 */

/* import modules */
const Promise = require("bluebird");
const sizeof = require('sizeof').sizeof;
const neo4j = require('neo4j-driver').v1;
const cli = require('commander');
const Enums = require('../enums');
const core = require('../test-core');
const pkg = require('../../../package.json');


/*==========================   PARAMETERS  =========================*/

/* single database server: local */
// const host  = 'bolt://localhost';
/* single database server: mc17 */
const host  = 'bolt://pdsl19.cs.purdue.edu';
/* cluster server: pdsl24 */
// const host  = 'bolt+routing://pdsl24.cs.purdue.edu:7687';

/* Performance Benchmars Types */
var BenchmarkType = Enums.Test;

/* Database */
let dbName = 'biogrid';
/* input for read test */
// let input = __dirname + '/../../data/pokec-50k.csv';
// let input = __dirname + '/../../data/citation-50k.csv';
let input = __dirname + '/../../data/biogrid-10.csv';
/* indices to use for read/write test */
let indices =  __dirname + '/../../data/random-5k.csv';
/* lowerbound id used for inserted objects */
var baseId = 2000000;

/*========================  CLASS DEFINITION  ======================*/

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
        this._write = 0
        this._size = 0;
        this._ctrl = 0;
        this._receivedReq = 0;
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
        /* Create a session to run Cypher statements in. */
        self._session = self._driver.session();
        /* Since version 1.3.0 connection is done lazy */
        self._session.run('RETURN 1').then(() => {

            /* proceed with using the driver, it was successfully instantiated */
            // console.log('Driver instantiation success');
            /* start test */
            self.doTest();

        }).catch(error => {

            /* Fail application startup */
            console.log('Error while trying to startup testcase: ', error);
        })

    }

    /**
     * Override
     * Clean variables
     */
    clean() {
        this._nproc = 0;
        this._write = 0
        this._size = 0;
        this._ctrl = 0;
        this._receivedReq = 0;
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
    singleReadTest(id, film, resolve, reject, totalReq) {

        /* This instance object reference */
        let self = this;
        /* CQL to extract films by name */
        // let query = "MATCH (f:Film) -[]-> () WHERE f.name = {name} RETURN f";
        /* pokec */
        // let query = "MATCH (u:User {userId: {name}}) RETURN u";
        /* citation */
        // let query = "MATCH (u:Paper {paperId: {name}}) RETURN u";
        /* biogrid */
        let query = "MATCH (u:Protein {proteinId: {name}}) RETURN u";
        /* Parameters for CQL */
        let param = {name: film};
        /* Results */
        let result = this._session.run(query, param);


        result
            .subscribe({
                onNext: function(record) {
                    // console.log('[%d] ==> ', self._nproc, record._fields);
                    /* pokec */
                    // let control = Number(record._fields[0].properties.userId);
                    /* citation */
                    let control = Number(record._fields[0].properties.paperId);
                    self._ctrl  = self._ctrl + control;

                    self._nproc++
                    self._size += sizeof(record);
                },
                onCompleted: function(metadata) {
                    // console.log('onCompleted: ', metadata);
                    self._receivedReq++;
                    if(self._receivedReq >= totalReq) {
                        resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
                    }
                },
                onError: function(error) {
                    console.log('SingleRead [ERR] ==> ', error);
                    reject(error);
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
    singleWriteTest(id, name, resolve, reject, totalReq) {

        /* This instance object reference */
        let self = this;
        /* CQL to create a vertex */
        let query = "CREATE (u:User {userId:{id}, age:{age}, completion_percentage:{complete}, gender:{gender}, region:{region}})";
        /* Parameters for CQL */
        let param = {id:baseId++, age: id, complete: 99, gender: 0, region: 'Westworld'};
        /* Results */
        let result = self._session.run(query, param);

        result
            .then(record => {
                // console.log(record);
                self._size += sizeof(record);
                self._nproc++
                self._receivedReq++;
                self._write++;
                if(self._receivedReq >= totalReq) {
                    resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl, write: self._write});
                }

            })
            .catch(error => {
                console.log('SingleWrite [ERR] ==> ', error);
                reject(error);
            });

    }

    /**
     * Reads/Writes (90/10 load)
     * The test consists on read an input file, and retrieve a vertex and update the properties of that vertex.
     * @param id
     * @param film
     * @param resolve
     * @param reject
     */
    singleReadWriteTest(id, film, resolve, reject, totalReq, doWrite) {

        /* This instance object reference */
        let self = this;
        /* CQL to create a vertex */
        let query;
        /* If doWrite == true we must perform an update, otherwise is just a select */
        if (doWrite)
            query = "MATCH (u:User {userId: {name}}) SET u.test = {value}  RETURN u";
        else
            query = "MATCH (u:User {userId: {name}}) RETURN u";
        /* Parameters for CQL */
        let param = {name: film, value: "yes"};
        /* Results */
        let result = self._session.run(query, param);

        if (doWrite) {

            /* update */
            result
                .then(record => {
                    // console.log(record.records[0]._fields);
                    self._size += sizeof(record);
                    self._nproc++
                    self._receivedReq++;
                    self._write++;
                    let control = Number(record.records[0]._fields[0].properties.userId);
                    self._ctrl  = Math.round((self._ctrl + control) * 100000000) / 100000000;
                    if(self._receivedReq >= totalReq) {
                        resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl, write: self._write});
                    }
                })
                .catch(error => {
                    console.log('SingleReadWrite [ERR] ==> ', error);
                    reject(error);
                });

        } else {

            /* read */
            result
                .subscribe({
                    onNext: function(record) {
                        // console.log('[%d] ==> ', self._nproc, record._fields);
                        let control = Number(record._fields[0].properties.userId);
                        self._nproc++
                        self._size += sizeof(record);
                        self._ctrl  = Math.round((self._ctrl + control) * 100000000) / 100000000;
                    },
                    onCompleted: function(metadata) {
                        // console.log('onCompleted: ', metadata);
                        self._receivedReq++;
                        if(self._receivedReq >= totalReq) {
                            resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl, write: self._write});
                        }
                    },
                    onError: function(error) {
                        console.log('SingleReadWrite [ERR] ==> ', error);
                        reject(error);
                    }

                });

        }
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
        let times = 10;

        console.log('neo4j (%s)', dbName);

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

cli.version(pkg.version)
  .command('read       [options]', 'Launch SINGLE READ benchamark ')
  .command('write      [options]', 'Launch SINGLE READ+WRITE benchamark')
  .command('readwrite  [options]', 'Launch SINGLE WRITE benchmark')
  .option('-d, --dbname <string>', 'Set database')
  .option('-i, --input <string>', 'Set input file')
  .option('-t, --testcase <number>', 'Set testcase to execute', parseInt)
  .parse(process.argv);

if ( cli.dbname ) {
    dbName = cli.dbname;
}

if ( cli.input) {
    input = cli.input;
}

if ( cli.testcase) {
    console.log(cli.testcase);
}

process.exit();

let t = new PerformanceBenchmarkNeo({input: input, type: BenchmarkType.SINGLE_READ});
// let t = new PerformanceBenchmarkNeo({input: input, type: BenchmarkType.SINGLE_WRITE});
// let t = new PerformanceBenchmarkNeo({input: input, indices: indices, type: BenchmarkType.SINGLE_READ_WRITE});
// let t = new PerformanceBenchmarkNeo({input: input, type: BenchmarkType.NEIGHBORS});
