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
const Socket = require('uws');
const Enums = require('../enums');
const core = require('../test-core');


/*==========================   PARAMETERS  =========================*/

const dbName = 'pokec';
// const dbName = 'films';
// const dbName = 'citations';
// const dbName = 'benchmark';
const host  = 'http://localhost';

/* Performance Benchmars Types */
var BenchmarkType = Enums.Test;
/* input for read test */
const input = __dirname + '/../../data/pokec-50k.csv';
/* indices to use for */
const indices =  __dirname + '/../../data/random-5k.csv';
/* socket communication */
var ws = new Socket('ws://localhost:8008');

/*========================  CLASS DEFINITION  ======================*/


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
        this._write = 0;
        this._nproc = 0;
        this._counter = 0;
        this._receivedReq = 0;
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
        /* Create callbacks reference */
        self.callbacks = {};

        /* socket communication callbacks */
        ws.on('open', function open() {
            console.log('connected');
            /* launch tests */
            self.doTest();
        });

        ws.on('error', function error() {
            console.log('Error connecting!');
        });

        ws.on('message', function(data, flags) {
            var obj = JSON.parse(data);
            // console.log('--> ', obj.object[0]._source.prop.control);
            // control += obj.object[0]._source.prop.control;
            /* invoke the callback */
            self.callbacks[obj.callbackIndex](obj);

            //console.log('Message: ' + data);
        });

        ws.on('close', function(code, message) {
            console.log('Disconnection: ' + code + ', ' + message);
        });
    }

    /**
     * Override
     * Clean variables
     */
    clean() {
        this._size = 0;
        this._ctrl = 0;
        this._write = 0;
        this._nproc = 0;
        this._counter = 0;
        this._receivedReq = 0;

        this.callbacks = {};
    }

    /**
     * Override.
     * Close Trueno session.
     */
    close() {
        /* Disconnect Trueno session */
        // this._trueno.disconnect();
        process.exit();
    }

    /*======================= BENCHMARK TESTCASES ======================*/

    /*
     * Function used to access data from the graph storage.
     * The functions use specific features of the graph db API.
     */


    /**
     * Single Reads using Native ElasticSearch driver throught socket connection .
     * The test consists on open an input file, and read a single vertex (and all its properties) by accessing the vertex
     * using an index.
     * @param film
     * @param resolve
     * @param reject
     */
    singleReadSocketTest(id, film, resolve, reject, totalReq) {

        /* This instance object reference */
        let self = this;
        let counter = 'films-' + id;
        /* Query for filtering vertices */
        // let q = "{\"term\":{\"prop.filmId\":\"" + film + "\"}}";
        // let q = "{\"term\":{\"prop.filmId\":\"" + film + "\"}}";
        let q = "{\"query\":{\"bool\":{\"filter\":{\"term\":{\"_id\":\""+film+"\"}}}}}";

        /* the payload object */
        var internal = {
            query: q,
            index: dbName,
            type: "v",
            size: 1000
        };

        var payload = {
            callbackIndex: counter,
            action: "search",
            object: internal
        };


        ws.send(JSON.stringify(payload));
        /* adding callback */
        self.callbacks[counter] = function(results){
            // console.log('[%d] {%d | %s} ==> ', self._nproc, id, film, self._ctrl, results); //results._source.prop.control, results);
            let control = 0; //results.object[0]._source.prop.control;
            self._ctrl  = Math.round((self._ctrl + control) * 100000000) / 100000000;

            self._nproc++;
            self._size += sizeof(results);
            self._receivedReq++;


            if(self._receivedReq >= totalReq){
                resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
            }
        };

    }

    /**
     * Single Writes
     * The test consists on open an input file, and create a vertex using the input data.
     * @param id
     * @param name
     * @param resolve
     * @param reject
     */
    singleWriteTest(id, film, resolve, reject, totalReq) {

    }

    /**
     * Reads/Writes (typically 90/10)
     * The test consists on read an input file, and retrieve a vertex and update the properties of that vertex.
     * @param id
     * @param film
     * @param resolve
     * @param reject
     * @param totalReq
     * @param doWrite   true if a write operation will be executed, false otherwise
     */
    singleReadWriteTest(id, film, resolve, reject, totalReq, doWrite) {

        /* This instance object reference */
        let self = this;
        let counter1 = 'films-' + id;
        let counter2 = 'persist-' + id;
        /* Query for filtering vertices */
        // let q = "{\"term\":{\"prop.filmId\":\"" + film + "\"}}";
        // let q = "{\"term\":{\"prop.filmId\":\"" + film + "\"}}";
        let q = "{\"query\":{\"bool\":{\"filter\":{\"term\":{\"_id\":\""+film+"\"}}}}}";

        /* the payload object */
        var internal = {
            query: q,
            index: dbName,
            type: "v",
            size: 1000
        };

        var payload = {
            callbackIndex: counter1,
            action: "search",
            object: internal
        };


        ws.send(JSON.stringify(payload));
        /* adding callback */
        self.callbacks[counter1] = function(results){
            // console.log('[%d] {%d | %s} ==> ', self._nproc, id, film, self._ctrl, results); //results._source.prop.control, results);
            let control = 0; //results.object[0]._source.prop.control;
            self._ctrl  = Math.round((self._ctrl + control) * 100000000) / 100000000;

            /* if the object is marked for writing, do it */
            if (doWrite) {
                let obj = results.object[0]._source;

                /* update a field */
                obj._prop.test = "yes";
                let internal_2  = {
                    index: dbName,
                    type: 'v',
                    id: obj.id,
                    source: obj
                }

                let payload_2 = {
                    callbackIndex: counter2,
                    action: "persist",
                    object: internal_2
                }

                let promise = new Promise((resolve, reject) => {
                    ws.send(JSON.stringify(payload_2));

                    // console.log('write!');
                    /* adding callback */
                    self.callbacks[counter2] = function(results){
                        // console.log('write done!');
                        resolve({write: 1});
                    };

                });

                promise.then(count => {
                    // console.log('-->', count.write);

                    self._write++;
                    self._nproc++;
                    self._size += sizeof(results);
                    self._receivedReq++;

                    if(self._receivedReq >= totalReq){
                        resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl, write: self._write});
                    }

                })
            } else {

                self._nproc++;
                self._size += sizeof(results);
                self._receivedReq++;

                if(self._receivedReq >= totalReq){
                    resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl, write: self._write});
                }
            }

        };

    }


    /**
     * Neighbors (1 hop)
     * The test consists on read an input file, and ask for all the direct neighbors of a vertex.
     * @param id
     * @param film
     * @param resolve
     * @param reject
     * @param totalReq   the number of request that are contained in the promise
     */
    neighborsTest(id, film, resolve, reject, totalReq) {

    }

    dummy() {
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
                // self.test = self.neighborsTest;
                self.test = self.neighborsSocketTest;
                self.repeatTestCase('Neighbors', times);
                break;

            /* Single Read + Write */
            case BenchmarkType.SINGLE_READ_WRITE:
                self.test = self.singleReadWriteTest;
                // self.test = self.dummy;
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
                self.test = self.singleReadSocketTest;
                self.repeatTestCase('Single Reads', times);
                break;
        }
    }

}

/* exporting the module */
module.exports = PerformanceBenchmarkTrueno;

let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_READ});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_WRITE});
// let t = new PerformanceBenchmarkTrueno({input: input, indices: indices, type: BenchmarkType.SINGLE_READ_WRITE});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.NEIGHBORS});
