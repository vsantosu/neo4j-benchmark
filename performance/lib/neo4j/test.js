"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */

/* import modules */
const Promise = require("bluebird");
const neo4j = require('neo4j-driver').v1;
const csv = require('csv-parser');
const fs = require('fs');

// const host  = 'bolt://mc17.cs.purdue.edu';
const host  = 'bolt://localhost';

/* input for testing */
const input = __dirname + '/../../data/directors-10000.csv';;

// Create a driver instance, for the user neo4j with password neo4j.
// It should be enough to have a single driver per database per application.
var driver = neo4j.driver(host, neo4j.auth.basic("neo4j", "trueno"));

// Register a callback to know if driver creation was successful:
driver.onCompleted = function() {
    // proceed with using the driver, it was successfully instantiated
    console.log('Driver instantiation success');
    // start test
    doTest();
};

// Register a callback to know if driver creation failed.
// This could happen due to wrong credentials or database unavailability:
driver.onError = function(error) {
    console.log('Driver instantiation failed', error);
};

// Create a session to run Cypher statements in.
// Note: Always make sure to close sessions when you are done using them!
let session = driver.session();

let query1 = "MATCH (d:Director) -[]-> () WHERE d.name = {name} RETURN d";
let query2 = "CREATE (a:Vertex {id:{id}, name:{name}, city:{city}, age:{age}})";
let query3 = "MATCH (n:Director {name: {name}}) SET n.age = {value}  RETURN n"
let query4 = "MATCH (d:Director) -[r:FILMS]-> (f:Film) WHERE d.name = {name} RETURN f"

let hrstart = [];
let hrend = [];
let nproc = [];

// get a director by its name
function getDirector(director, resolve, reject) {
    let param1 = {name: director};
    let result = session.run(query1, param1);

    return new Promise(() => {
        result
            .subscribe({
                onNext: function(record) {
                    // console.log('onNext');
                },
                onCompleted: function() {
                    nproc[0]++;
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

// create a director
function setDirectorbyId(directorId, directorName, resolve, reject) {
    let param2 = {id:directorId, name:directorName, city:'Somewhere', age:99};
    let result = session.run(query2, param2);

    return new Promise(() => {
        result
            .then(record => {
                // console.log(record);
                nproc[1]++;
                resolve();
            })
            .catch(error => {
                console.log(error);
                reject();
            });
    });
}

// set a director by its name
function setDirector(director, resolve, reject) {
    let param3 = {name: director, value: 1};
    let result = session.run(query3, param3);

    return new Promise(() => {
        result
            .then(record => {
                // console.log(record);
                nproc[1]++;
                resolve();
            })
            .catch(error => {
                console.log(error);
                reject();
            });
    });
}

// get all the films of a director
function getFilms(director, resolve, reject) {
    let param4 = {name: director};
    let result = session.run(query4, param4);

    return new Promise(() => {
        result
            .subscribe({
                onNext: function(record) {
                    nproc[2]++;
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
                    console.log('Single Reads\t%ds %dms\t%d records\t%d records/s', hrend[0][0], hrend[0][1]/1000000, nproc[0], nproc[0]/(hrend[0][0] + hrend[0][1]/1000000000));
                    session.close();
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

                for (let k=0; k < directors.length; k++) {
                    promiseArray.push(
                        new Promise((resolve, reject) => {
                            /* Retrieve films */
                            setDirectorbyId(k, directors[k], resolve, reject);
                        })
                    );
                }

                Promise.all(promiseArray).then(() => {
                    hrend[1] = process.hrtime(hrstart[1]);
                    console.log('Single Writes\t%ds %dms\t%d records\t%d records/s', hrend[1][0], hrend[1][1]/1000000, nproc[1], nproc[1]/(hrend[1][0] + hrend[1][1]/1000000000));
                    session.close();
                    resolve();
                });
            })
    })
}

function singleReadWrites() {

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
                    promiseArray.push(
                        new Promise((resolve, reject) => {
                            /* Retrieve films */
                            setDirector(directors[k], resolve, reject);
                        })
                    )
                }

                Promise.all(promiseArray).then(() => {
                    hrend[1] = process.hrtime(hrstart[1]);
                    console.log('Single Read+Writes\t%ds %dms\t%d records\t%d records/s', hrend[1][0], hrend[1][1]/1000000, nproc[1], nproc[1]/(hrend[1][0] + hrend[1][1]/1000000000));
                    session.close();
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
                    session.close();
                    resolve(hrend - hrstart);
                });
            })
    })

}

function doTest() {

    console.log('neo4j');
    console.log('doTest');

    /* init */
    nproc[0] = 0;
    nproc[1] = 0;
    nproc[2] = 0;

    /* single reading */
    // singleReads();

    /* single writing */
    singleWrites();

    /* single reading/writing */
    // singleReadWrites();

    /* neighbors reading */
    // neighbors();

    /* Close driver instance */
    // driver.close();
}
