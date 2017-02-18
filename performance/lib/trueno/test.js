"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */

/* import modules */
const Promise = require("bluebird");
const Trueno = require('trueno-javascript-driver');
const csv = require('csv-parser');
const fs = require('fs');

const dbName = 'movies';
const host  = 'http://localhost';

/* Instantiate connection */
let trueno = new Trueno({host: host, port: 8000, debug: false});
let g;


var counter =0;
var limit = 100000000;

/* input for test1 */
const input = __dirname + '/../../data/directors-500.csv';


let hrstart = [];
let hrend = [];
let nproc = [];
let ncontrol;


function debug100(index) {
    let jmp = 100;
    if (nproc[index] > ncontrol) {
        console.log('%d records', nproc[index])
        ncontrol += jmp;
    }
}

// get a director by its name
function getDirector(director, resolve, reject) {

    let filter = g.filter()
        .term('prop.name', director);

    return new Promise(() => {
<<<<<<< HEAD
        if(++counter <= limit){
            g.fetch('v', filter)
                .then(result => {
                    //console.log(result);
                    resolve();
                    // console.log('then');
                })
                .catch(error => {
                    console.log(error);
                    reject();
                });
         }
=======
        g.fetch('v', filter)
            .then(result => {
                nproc[0]++;
                resolve();
                // console.log('then');
            })
            .catch(error => {
                console.log('ERR ==> ', error);
                reject();
            });
    });

}

// get a director by its name
function setDirectorbyName(director, resolve, reject) {

    let promises = [];
    let filter = g.filter()
        .term('prop.name', director);

    return new Promise(() => {
        g.fetch('v', filter)
            .then(results => {
                results.forEach(v => {
                    v.setProperty('age', 1);

                    promises.push(
                        new Promise((resolve, reject) => {
                            /* Persist Changes */
                            v.persist()
                                .then(result => {
                                    // console.log('persist');
                                    nproc[1]++;
                                    resolve();
                                }, error => {
                                    console.log('ERR ==> [%s]', director);
                                    console.log('ERR ==> ', error);
                                    reject()
                                });
                        })
                    );

                });

                Promise.all(promises)
                    .then(() => {
                        resolve();
                    });

            }, error => {
                console.log('ERR ==> [%s] [%d] processed', director, nproc[1]);
                console.log('ERR ==> ', error);
                reject();
            });
    });

}

// get a director by its name
function setDirectorbyId(director, resolve, reject) {

    let filter = g.filter()
        .term('prop.name', director);

    return new Promise(() => {
        g.fetch('v', filter)
            .then(result => {
                resolve();
                // console.log('then');
            })
            .catch(error => {
                console.log('ERR ==> ', error);
                reject();
            });
>>>>>>> 517a0b0dc48235128bf19f6e1fcf3e3d9e0e30a9
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
<<<<<<< HEAD
                    // console.log(v);
                    //console.log(v);
=======
>>>>>>> 517a0b0dc48235128bf19f6e1fcf3e3d9e0e30a9
                    v.out('v')
                        .then(vertices => {
                            nproc[2]++;
                            resolve();
                            // console.log('then');
                        })
                        .catch(error => {
                            console.log('ERR ==> ', error);
                            reject();
                        });
                })
            }, error => {
                console.log('ERR ==> [%s] [%d] processed', director, nproc[1]);
                console.log('ERR ==> ', error);
                reject();
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
                    console.log('Single Reads\t%ds %dms\t%d records\t%d records/s', hrend[0][0], hrend[0][1]/1000000, nproc[0], nproc[0]/(hrend[0][0] + hrend[0][1]/1000000000));
                    trueno.disconnect();
                    resolve();
                });
            })
    })

}

function singleWrites() {
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

                hrstart[1] = process.hrtime();

                for (let k in directors) {
                    // console.log('--> directors: ',directors[k]);
                    promiseArray.push(
                        new Promise((resolve, reject) => {
                            /* Retrieve films */
                            setDirectorbyName(directors[k], resolve, reject);
                        })
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[1] = process.hrtime(hrstart[1]);
                    console.log('Single Writes\t%ds %dms\t%d records\t%d records/s', hrend[1][0], hrend[1][1]/1000000, nproc[1], nproc[1]/(hrend[1][0] + hrend[1][1]/1000000000));
                    trueno.disconnect();
                    resolve();
                });
            })
    })

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
                for (let k in directors) {
                    promiseArray.push(
                        new Promise((resolve, reject) => {
                            /* Retrieve films */
                            getFilms(directors[k], resolve, reject);
                        })
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[2] = process.hrtime(hrstart[2]);
                    console.log('Neighbors\t%ds %dms\t%d records\t%d records/s', hrend[2][0], hrend[2][1]/1000000, nproc[2], nproc[2]/(hrend[2][0] + hrend[2][1]/1000000000));
                    trueno.disconnect();
                    resolve(hrend - hrstart);
                });
            })
    })

}


function doTest() {

    console.log('Trueno');
    console.log('doTest');

    /* init */
    ncontrol = 0;
    nproc[0] = 0;
    nproc[1] = 0;
    nproc[2] = 0;

    /* single reading */
     singleReads();

    /* single writing */
    // singleWrites();

    /* neighbors reading */
    //neighbors();

}


trueno.connect(s => {

    /* Create Graph instance */
    g = trueno.Graph();
    g.setLabel(dbName);

    /* Open trueno database instance */
    g.open().then( (result) => {
        /* execute test cases */
        doTest();
    });

}, s => {
    console.log('disconnected: ', dbName);
});

