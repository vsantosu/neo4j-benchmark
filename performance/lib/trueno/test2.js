"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */

/* import modules */
const Promise = require("bluebird");
const elasticsearch = require('elasticsearch');
const csv = require('csv-parser');
const fs = require('fs');

const dbName = 'movies';
const host  = 'http://localhost';

/* Instantiate connection */
var client = new elasticsearch.Client({
    host: 'localhost:8004'
});


var counter =0;
var limit = 10000000000;
var total = 0;

/* input for test1 */
const input = __dirname + '/../../data/directors-5000.csv';

let hrstart = [];
let hrend = [];

function getDirector(director, resolve, reject) {

    var f = '{"query":{"filtered":{"filter":{"term":{"prop.name":"'+director+'"}}}}}';
    var q = "{ size: 1000, index: 'movies',type: 'v',body: { query: { filtered: "+ f+" } } }";


    return new Promise(() => {
        if(++counter <= limit){
            
            var hrstart = process.hrtime();

            client.search(q).then(result => {
                    var hrend = process.hrtime(hrstart);
                   // console.info("Execution time: %dms", hrend[1]/1000000);
                    //console.log(result);
                    total++;
                    resolve();
                    // console.log('then');
                })
                .catch(error => {
                    console.log(error);
                    reject();
            });
         }
    });

}

// get all the films of a director
function getFilms(director, resolve, reject) {

    let filter = g.filter()
        .term('prop.name', director);

    return new Promise(() => {
        g.fetch('v', filter)
            .then(results => {
                results.forEach(v => {
                    // console.log(v);
                    //console.log(v);
                    v.out('v')
                        .then(vertices => {
                            resolve();
                            // console.log('then');
                        })
                        .catch(error => {
                            console.log(error);
                            reject();
                        });
                })
            })
            .catch(error => {
                console.log(error);
                reject();
            });
    });


    return new Promise(() => {
        result
            .subscribe({
                onNext: function(record) {
                    // console.log('onNext');
                },
                onCompleted: function() {
                    resolve();
                    // console.log('onCompleted');
                },
                onError: function(error) {
                    // console.log('onError');
                    console.log(error);
                    reject();
                }

            });
    });

}

function singleReads() {

    let self = this;
    let directors = [];
    let promiseArray = [];

    return new Promise((resolve, reject) => {

        fs.createReadStream(input)
            .pipe(csv({separator: ','}))
            .on('data', function(data) {
                // console.log('-->', data.name);
                directors.push(data.name);
            })
            .on('end', function() {
                console.log('----> end');

                hrstart[0] = process.hrtime();

                for (let k in directors) {
                    promiseArray.push(
                        new Promise((resolve, reject) => {
                            /* Retrieve films */
                            getDirector(directors[k], resolve, reject);
                        })
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[0] = process.hrtime(hrstart[0]);
                    console.log('Single Reads     %ds %dms', hrend[0][0], hrend[0][1]/1000000, (total/hrend[0][0]) + " docs/s");
                    resolve();
                });
            })
    })

}

function singleWrites() {

}

function neighbors() {

    let self = this;
    let directors = [];
    let promiseArray = [];

    let hrstart = process.hrtime();

    return new Promise((resolve, reject) => {

        fs.createReadStream(input)
            .pipe(csv({separator: ','}))
            .on('data', function(data) {
                // console.log('-->', data.name);
                directors.push(data.name);
            })
            .on('end', function() {
                // console.log('----> end');

                hrstart[2] = process.hrtime();
                for (let k in directors[1]) {
                    promiseArray.push(
                        new Promise((resolve, reject) => {
                            /* Retrieve films */
                            getFilms(directors[k], resolve, reject);
                        })
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[2] = process.hrtime(hrstart[2]);
                    console.log('Neighbors        %ds %dms', hrend[2][0], hrend[2][1]/1000000);
            
                    resolve(hrend - hrstart);
                });
            })
    })

}


function doTest() {

    console.log('Trueno');
    console.log('doTest');

    /* single reading */
     singleReads();

    /* neighbors reading */
    //neighbors();

}


/* trying ping the search engine */
client.ping({
    requestTimeout: 10000
    }, (error)=> {
    if (error) {
      console.log('error',error);
    } else {
      /* Resolve sync promise */
     doTest();
}
});

