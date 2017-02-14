/**
 * Created by: edgardo on 2/9/17.
 * Source: .js
 * Author: edgardo
 * Description:
 *
 */
const neo4j = require('neo4j-driver').v1;
const vertices = require('./movie/vertices.json');

/* Instantiate connection */
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neoj4"));

/* Register a callback to know if driver creation failed. */
/* This could happen due to wrong credentials or database unavailability */
driver.onError = function(error) {
  console.log('Driver instantiation failed', error);
};

/* Create a session to run Cypher statements in. */
var session = driver.session();
const batchSize = 300;

let eQueue = Object.keys(vertices);
let total = eQueue.length, current = 0;
console.log(total);

/* Register a callback to know if driver creation was successful */
driver.onCompleted = function() {
  /* proceed with using the driver, it was successfully instantiated */
  console.log('Driver instantiation success');
  console.time("main");
  /* Insertion function */
  function insertEdge(arr) {

    var query = [];
    /* Persist all vertices */
    arr.forEach((vkey)=> {
      let vertex = vertices[vkey];
      var name = (vertex.name  && vertex.name.replace)?vertex.name.replace(/'/g,''):'';
      query.push("CREATE (a" +vkey+":Vertex {id:'"+vertex.id +"',label:'"+vertex.label+"',genreId:'"+ vertex.genreId+ "',name:'"+ name+ "'})");
    });

    //console.time("time");
    session.run(query.join('\n'))
    .then(function(result){
        //console.timeEnd("time");
        /* Continue inserting */
        if (eQueue.length) {
          insertEdge(eQueue.splice(0, batchSize));
        } else {
          console.timeEnd("main");
          session.close();
          process.exit();
        }
    })
    .catch(function(error) {
        console.timeEnd("time");
        console.log("Error: Edge batch creation failed.", error, current / total);
        /* Continue inserting */
        if (eQueue.length) {
          insertEdge(eQueue.splice(0, batchSize));
        } else {
          console.timeEnd("main");
          session.close();
          process.exit();
        }
    });
  }

  /* Initiating vertex insertion */
  insertEdge(eQueue.splice(0, batchSize));

};
