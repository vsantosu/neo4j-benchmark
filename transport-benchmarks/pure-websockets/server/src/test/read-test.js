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
var limit = 1000000;
var total = 0;
var counter = 0;
const INTERVAL = 1;
var queue = [];

/* input for test1 */
const input = __dirname + '/directors-5000.csv';

var hrstart = [];
var hrend = [];
var callbacks = {};

function getDirector(counter) {

    var director = "The Big Noise" +counter;

    var q = "{\"query\":{\"bool\":{\"filter\":{\"term\":{\"prop.name\":\""+director+"\"}}}}}";

    return new Promise((resolve, reject) => {
        /* the payload object */
        var payload = {
            callbackIndex: counter,
            query: q,
            index: "movies",
            type: "v",
            size: 1000
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

    return new Promise((resolve, reject) => {

        fs.createReadStream(input)
            .pipe(csv({separator: ','}))
            .on('data', function(data) {
                directors.push(data.name);
            })
            .on('end', function() {
                console.log('----> end');

                hrstart[0] = process.hrtime();

                for (var i = 0;i < limit; i++) {
                    promiseArray.push(
                            /* Retrieve films */
                            getDirector("director"+i)
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[0] = process.hrtime(hrstart[0]);
                    console.log('Single Reads     %ds %dms', hrend[0][0], hrend[0][1]/1000000, (total/hrend[0][0]) + " docs/s");
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
    //console.log(obj);
    /* invoke the callback */
    callbacks[obj.callbackIndex]();

    //console.log('Message: ' + data);
});

ws.on('close', function(code, message) {
    console.log('Disconnection: ' + code + ', ' + message);
});