"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * Performance benchmarks test suite for TruenoDB.
 *
 * @module lib/trueno/test-trueno
 * @see performance:lib/test-core
 */

/* import modules */
const Promise = require("bluebird");
const sizeof = require('sizeof').sizeof;
const Socket = require('uws');
const Enums = require('../enums');
const core = require('../test-core');


/*==========================   PARAMETERS  =========================*/

/* Performance Benchmars Types */
var BenchmarkType = Enums.Test;
/* socket communication */
var ws;
/* lowerbound id used for inserted objects */
var baseId = 2000000;

/* queries according to database */
let query_read = [];
let query_write = [];
let query_read_write = [];

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

        /* Set parameters queries according to database */
        query_read['film']     = "_prop.filmId";
        query_read['pokec']    = "_id";
        query_read['citation'] = "_id";
        query_read['biogrid']  = "_id";

        query_read_write['film']     = "_prop.filmId";
        query_read_write['pokec']    = "_id";
        query_read_write['citation'] = "_id";
        query_read_write['biogrid']  = "_id";

        /* Set control function according to database */
        switch (self._dbName) {
            case "film":
                self.getControl = self.getControlFilm;
                break;

            case "pokec":
                self.getControl = self.getControlPokec;
                break;


            case "citation":
                self.getControl = self.getControlCitation;
                break;


            case "biogrid":
                self.getControl = self.getControlBiogrid;
                break;
        }

        ws = new Socket(self._config.url);

        /* socket communication callbacks */
        ws.on('open', function open() {
            console.log('connected');
            /* launch tests */
            self.doTest();
        });

        ws.on('error', function error(err) {
            console.log('Error connecting to ', self._config.url);
            console.log(err);
        });

        ws.on('message', function(data, flags) {
            var obj = JSON.parse(data);
            // console.log('--> ', obj.object[0]._source.prop.control);
            // control += obj.object[0]._source.prop.control;
            /* invoke the callback */
            self.callbacks[obj.callbackId](obj);

            // console.log('Message: ' + data);
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
        process.exit();
    }

    /* pokec */
    getControlPokec(results) {
        return Number(results.resultSet[0]._source.id);
    }

    /* biogrid */
    getControlBiogrid(results) {
        return Number(results.resultSet[0]._source.id);
    }

    /* citation */
    getControlCitation(results) {
        return Number(results.resultSet[0]._source.id);
    }

    /* film */
    getControlFilm(results) {
        return Number(results.resultSet[0]._source._prop.control);
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
    singleReadTest(id, film, resolve, reject, totalReq) {

        /* This instance object reference */
        let self = this;
        /* Callback function names */
        let cb_ok = 'films-ok-' + id;
        let cb_fail = 'films-fail-' + id;
        /* Query for filtering vertices */
        let q = "{\"bool\":{\"filter\":{\"term\":{\"" + query_read[self._dbName] + "\":\"" + film + "\"}}}}";

        /* the payload object */
        var internal = {
            query: q,
            index: self._dbName,
            type: "v",
            size: 1000
        };

        var payload = {
            callbackIdOK: cb_ok,
            callbackIdError: cb_fail,
            action: "search",
            object: internal
        };


        ws.send(JSON.stringify(payload));
        /* adding callback */
        self.callbacks[cb_ok] = function(results){
            console.log('[%d] {%d | %s} (%s) ==> ', self._nproc, id, film, q, self._ctrl, results); //results._source.prop.control, results);
            let control = self.getControl(results);
            self._ctrl  = self._ctrl + control;

            self._nproc++;
            self._size += sizeof(results);
            self._receivedReq++;


            if(self._receivedReq >= totalReq){
                resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl});
            }
        };

        /* adding failure callback */
        self.callbacks[cb_fail] = function(results){
            console.log('ERR [%d] ==> ', id, results);
            reject(results);
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
        /* This instance object reference */
        let self = this;
        let counter = 'persist-' + id;
        /* Object to be inserted */
        let obj = {};
        obj.id=baseId++;
        obj._prop={};
        obj._prop.age = id;
        obj._prop.complete = 99;
        obj._prop.gender = 0;
        obj._prop.region = 'Westworld';

        let internal  = {
            index: self._dbName,
            type: 'v',
            id: obj.id,
            source: obj
        }

        let payload = {
            callbackIndex: counter,
            action: "persist",
            object: internal
        }

        ws.send(JSON.stringify(payload));

        // console.log('write!');
        /* adding callback */
        self.callbacks[counter] = function(results){
            // console.log('write done!');
            self._write++;
            self._nproc++;
            self._size += sizeof(results);
            self._receivedReq++;

            if(self._receivedReq >= totalReq){
                resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl, write: self._write});
            }
        }

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
        let q = "{\"bool\":{\"filter\":{\"term\":{\"" + query_read_write[self._dbName] + "\":\"" + film + "\"}}}}";

        /* the payload object */
        var internal = {
            query: q,
            index: self._dbName,
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
            // console.log('[%d] {%d | %s} ==> ', self._nproc, id, film, self._ctrl, results.object[0]._source); //results._source.prop.control, results);
            let control = self.getControl(results);
            self._ctrl  = self._ctrl + control;

            /* if the object is marked for writing, do it */
            if (doWrite) {
                let obj = results.object[0]._source;

                /* update a field */
                obj._prop.test = "yes";
                let internal_2  = {
                    index: self._dbName,
                    type: 'v',
                    id: obj.id,
                    source: obj
                }

                let payload_2 = {
                    callbackIndex: counter2,
                    action: "persist",
                    object: internal_2
                }

                ws.send(JSON.stringify(payload_2));

                // console.log('write!');
                /* adding callback */
                self.callbacks[counter2] = function(results){
                    // console.log('write done!');
                    self._write++;
                    self._nproc++;
                    self._size += sizeof(results);
                    self._receivedReq++;

                    if(self._receivedReq >= totalReq){
                        resolve({nproc: self._nproc, size: self._size, ctrl: self._ctrl, write: self._write});
                    }

                };

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
        let times = 1;

        console.log('trueno (%s)', self._dbName);

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
                self.test = self.singleReadTest;
                self.repeatTestCase('Single Reads', times);
                break;
        }
    }

}

/* exporting the module */
module.exports = PerformanceBenchmarkTrueno;
