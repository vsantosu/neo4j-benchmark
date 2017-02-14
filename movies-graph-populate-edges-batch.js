/**
 * Created by: edgardo on 2/9/17.
 * Source: .js
 * Author: edgardo
 * Description:
 *
 */

const neo4j = require('neo4j-driver').v1;
const edges = require('./movie/edges.json');

/* Instantiate connection */
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neoj4"));
 
/* Register a callback to know if driver creation was successful */
driver.onCompleted = function() {
  /* proceed with using the driver, it was successfully instantiated */
  console.log('Driver instantiation success');
};

/* Register a callback to know if driver creation failed. */
/* This could happen due to wrong credentials or database unavailability */
driver.onError = function(error) {
  console.log('Driver instantiation failed', error);
};

/* Create a session to run Cypher statements in. */
var session = driver.session();


trueno.connect((s)=> {

  const batchSize = 300;

  /* Create a new Graph */
  let g = trueno.Graph();

  /* Set label: very important */
  g.setLabel(dbName);

  let eQueue = Object.keys(edges);
  let total = eQueue.length, current = 0;
  console.log(total);

  /* Insertion function */
  function insertEdge(arr) {

    /* Persist all vertices */
    arr.forEach((ekey)=> {
      let edgePair = edges[ekey];
      let e = g.addEdge(edgePair.source, edgePair.destination);
      e.setLabel(edgePair.label);
      e.setId(current);
      e.persist();
      current++;
    });

    session.run(query, param)
    .then(function(result){
        console.log("Edges batch created.", current / total);
        /* Continue inserting */
        if (eQueue.length) {
          insertEdge(eQueue.splice(0, batchSize));
        } else {
          console.timeEnd("time");
          session.close();
          process.exit();
        }
    })
    .catch(function(error) {
        console.log("Error: Edges batch creation failed.", error, current / total);
        /* Continue inserting */
        if (eQueue.length) {
          insertEdge(eQueue.splice(0, batchSize));
        } else {
          console.timeEnd("time");
          session.close();
          process.exit();
        }
    });
  }

  /* Initiating vertex insertion */
  insertEdge(eQueue.splice(0, batchSize));
