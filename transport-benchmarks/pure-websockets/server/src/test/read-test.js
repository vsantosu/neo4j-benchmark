"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * @modified Victor Santos Uceta (vsantos)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */

/* import modules */
const Promise = require("bluebird");
const csv = require('csv-parser');
var Socket = require('uws');
const fs = require('fs');


var ws = new Socket('ws://localhost:8008');
// var limit = 1000000;
var limit = 9;
var total = 0;
var control = 0;
var counter = 0;
const INTERVAL = 1;
var queue = [];

/* input for test1 */
const input = __dirname + '/../../../../../performance/data/films-10.csv';

var hrstart = [];
var hrend = [];
var callbacks = {};

function getDirector(counter, film) {

    var director = "The Big Noise";

    var q = "{\"query\":{\"bool\":{\"filter\":{\"term\":{\"prop.filmId\":\""+film+"\"}}}}}";

    return new Promise((resolve, reject) => {
        /* the payload object */
        var internal = {
            query: q,
            index: "films",
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
        callbacks[counter] = function(){
            total++;
            resolve();
        };
    });
}

function singleReads() {

    let directors = [];
    let promiseArray = [];
    let column;

    return new Promise((resolve, reject) => {

        fs.createReadStream(input)
            .pipe(csv({separator: ','}))
            .on('headers', function (headerList) {
                column = headerList[0]
            })
            .on('data', function(data) {
                // console.log('-->', data[column]);
                directors.push(data[column]);
            })
            .on('end', function() {
                console.log('----> end');

                hrstart[0] = process.hrtime();

                for (var i = 0;i < limit; i++) {
                    promiseArray.push(
                            /* Retrieve films */
                            getDirector("director"+i, directors[i])
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[0] = process.hrtime(hrstart[0]);
                    console.log('Single Reads     %ds %dms', hrend[0][0], hrend[0][1]/1000000, (total/hrend[0][0])
                        + " docs/s"
                        + "\t" + control);
                    process.exit(0);
                });
            })
    })
}


ws.on('open', function open() {
    console.log('connected');
    /* start reading */
    singleReads();
});

ws.on('error', function error() {
    console.log('Error connecting!');
});

ws.on('message', function(data, flags) {
    var obj = JSON.parse(data);
    // console.log('--> ', obj.object[0]._source.prop.control);
    control += obj.object[0]._source.prop.control;
    /* invoke the callback */
    callbacks[obj.callbackIndex]();

    //console.log('Message: ' + data);
});

ws.on('close', function(code, message) {
    console.log('Disconnection: ' + code + ', ' + message);
});