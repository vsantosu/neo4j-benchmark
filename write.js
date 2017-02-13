var neo4j = require('neo4j-driver').v1;


// Create a driver instance, for the user neo4j with password neo4j.
// It should be enough to have a single driver per database per application.
//var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neoj4"));
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neoj4"));

// Register a callback to know if driver creation was successful:
driver.onCompleted = function() {
  // proceed with using the driver, it was successfully instantiated
    console.log('Driver instantiation success');
};

// Register a callback to know if driver creation failed.
// This could happen due to wrong credentials or database unavailability:
driver.onError = function(error) {
  console.log('Driver instantiation failed', error);
};

// Create a session to run Cypher statements in.
// Note: Always make sure to close sessions when you are done using them!
var session = driver.session();

var query = "CREATE (a:Vertex {id:{id}, name:{name}})";
var param = {id:121321, name:'John'};

// Run a Cypher statement, reading the result in a streaming manner as records arrive:
session
  .run(query, param)
  .then(function(result){
  	console.log(result);
    // Completed!
    session.close();
  })
  .catch(function(error) {
    console.log(error);
  });
