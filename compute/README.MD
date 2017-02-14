# Compute Engine Benchmarks

# Trueno Compute Server
The TruenoDB distributed computation server.

> **Trueno Compute Server**
> Trueno Compute Server relies on Spark Job Server, and GraphX.

> 1. Page Rank Algorithm.
> 2. Connected Components.
> 3. Strongly Connected Components.
> 4. Triangle Counting.

## Spark Compute Server Algorithm Generator
We designed an algorithm generator. The architecture includes connectivity to a key value store in which the parameters of new algorithms will be stored.
The algorithm generator will create the **algorithms-release.jar** that will be uploaded into the Spark Job Server in order to receive **REST** requests.
The results will be stored in the Database (e.g. Apache Cassandra, Scylla).

---------------

# Using Apache Spark and Neo4j for Big Data Graph Analytics

## Mazerunner for Neo4j

Neo4j uses mazarunner for big data graph processing. Mazerunner is an unmanaged extension [1].
Apache Spark’s GraphX module constitutes the main component of Mazerunner. When an agent job is dispatched, a subgraph is
exported from Neo4j and written to Apache Hadoop HDFS.  After Neo4j exports a subgraph to HDFS, a separate service for
Spark is notified to begin processing that data [1].

One focus of this approach is on data safety, that’s why it uses a persistent queue (RabbitMQ) to communicate data between Neo4j and Spark [2].

The infrastructure is set up using Docker containers, there are dedicated containers for Spark, RabbitMQ, HDFS and Neo4j with the Mazerunner Extension [2].

**Example**

```http://mazerunner_docker_host:7474/service/mazerunner/analysis/{analysis}/{relationship_type}```

### Pagerank
```http://mazerunner_docker_host:7474/service/mazerunner/analysis/pagerank/ITERACTION```

###Architecture in a nutshell

----------

<p align="center">
  <img height="400" src="../assets/images/architecture.png">
</p>

----------

# References
* [1] https://neo4j.com/blog/using-apache-spark-neo4j-big-data-graph-analytics/
* [2] https://neo4j.com/developer/apache-spark/

