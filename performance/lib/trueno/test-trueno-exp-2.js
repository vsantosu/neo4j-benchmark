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
// const rx = require('rx');

const dbName = 'films';
// const dbName = 'citations';
// const dbName = 'benchmark';
const host  = 'http://localhost';

/* Performance Benchmars Types */
var BenchmarkType = Enums.Test;

// Parameters for test
/* input for test1 */
const input = __dirname + '/../../data/films-50k.csv';
/* max number of request */
var limit = 100000000;



// Variables needed for establish the socket connection
// var connectionOptions =  {
//     "force new connection" : true,
//     "reconnection": true,
//     "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
//     "reconnectionDelayMax" : 60000,             //1 minute maximum delay between connections
//     "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
//     "timeout" : 10000,                           //before connect_error and connect_timeout are emitted.
//     "transports" : ["websocket"]                //forces the transport to be only websocket. Server needs to be setup as well/
// }
//
// var socket = Socket('http://localhost:8009',connectionOptions);
var ws = new Socket('ws://localhost:8008');


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

        /* Create Graph instance */
        // self._g = self._trueno.Graph();
        // self._g.setLabel(dbName);
        // /* Establish a Trueno connection and register callbacks */
        // self._trueno
        //     .connect(s => {
        //         /* Open trueno database instance */
        //         // self._g.open()
        //         //     .then((result) => {
        //                 /* execute test cases */
        //                 self.doTest();
        //             // });
        // }, s => {
        //     console.log('disconnected from [%s]', dbName);
        //     process.exit();
        // });

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
        let q = "{\"query\":{\"bool\":{\"filter\":{\"term\":{\"prop.filmId\":\""+film+"\"}}}}}";

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
            let control = results.object[0]._source.prop.control;
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
     * Execute Test
     */
    doTest() {

        /* This instance object reference */
        let self = this;
        /* Times to repeat a testcase */
        let times = 10;

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
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.SINGLE_READ_WRITE});
// let t = new PerformanceBenchmarkTrueno({input: input, type: BenchmarkType.NEIGHBORS});
