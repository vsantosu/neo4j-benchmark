# 1. Compute Engine Benchmarks

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

## Using Apache Spark and Neo4j for Big Data Graph Analytics

### Mazerunner for Neo4j

Neo4j uses mazarunner for big data graph processing. Mazerunner is an unmanaged extension [1].
Apache Spark’s GraphX module constitutes the main component of Mazerunner. When an agent job is dispatched, a subgraph is
exported from Neo4j and written to Apache Hadoop HDFS.  After Neo4j exports a subgraph to HDFS, a separate service for
Spark is notified to begin processing that data [1].

One focus of this approach is on data safety, that’s why it uses a persistent queue (RabbitMQ) to communicate data between Neo4j and Spark [2].

### Architecture in a nutshell

<p align="center">
  <img height="400" src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/neo4j_mazerunner_arquitecture.png">
</p>

----------

## 1.1 Comparing Neo4j+Mazerunner and TruenoDB

Since they both depend on Spark GraphX the running time for the provided algorithms is roughly the same.
TruenoDB takes a little bit longer when requesting a job to the spark engine (Spark Job Server).

### GraphX PageRank Algorithm


| GraphDB                     | Spark Job Request (secs) | PageRank (secs) | Total |
| --------------------------- | ------------------------ | --------------- | ----- |
| TruenoDB                    |      3.0536457           | 26.2495         | 29.3031457 |
| Neo4j + Mazerunner + HDFS   |      2.2883707           | 30.4506902      | 32.7390609 |

<p align="left">
  <img height="400" src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/trueno_neo4j_compute_pagerank_plot.png">
</p>

----------

### GraphX Connected Components Algorithm

| GraphDB                     | Spark Job Request (secs) | Connected Components (secs) | Total |
| --------------------------- | ------------------------ | --------------------------- | ----- |
| TruenoDB                    |      3.0536457           | 9.0676                      | 12.1212457 |
| Neo4j + Mazerunner + HDFS   |      2.2883707           | 10.757                      | 13.0453707 |

<p align="left">
  <img height="400" src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/trueno_neo4j_compute_connectedcomponents_plot.png">
</p>

## 1.2 Neo4j-Spark-Connector

The Neo4j Spark Connector uses the binary **Bolt** protocol to transfer data from and to a Neo4j server.

Neo4j Spark Connector offers Spark-2.0 APIs for RDD, **DataFrame**, **GraphX** and **GraphFrames**.

## GraphX PageRank Algorithm - Trueno-ES-Spark Native Connector

| GraphDB                     | Loading data (secs) | PageRank (secs) | Total (secs) |
| --------------------------- |-------------------- | --------------- | ----- |
| Trueno + ES REST connector  |  46.097223           | 50.094236 | 96.19145884 |
| Trueno + ES native connector  |  18.21496109           | 50.77911589 | 68.99407698 | 
| Neo4j Spark Connector       |  7.588226894       | 42.54327112 |50.13149801|

<p align="center">
  <img height="400" src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/trueno_neo4j_compute_pr_connectors.png">
</p>

## GraphX Connected Components Algorithm

| GraphDB                     | Loading data (secs) | Connected Components (secs) | Total (secs) |
| --------------------------- |-------------------- | --------------- | ----- |
| Trueno + ES REST connector  |  43.102359           | 71.283560 | 114.3859181 |
| Trueno + ES native connector  |  18.32967072           | 12.46506647 | 30.79473719 | 
| Neo4j Spark Connector       |  7.826405755       | 6.482508676 |14.30891443|


<p align="center">
  <img height="400" src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/trueno_neo4j_compute_cc_connectors.png">
</p>

----------

# 2. Performance Benchmarks (REST client)

Trueno access ElasticSearch Backend via a REST (http) connection. The REST connection incurs on some overhead and latency.

|	GraphDB | Single Reads (records/secs)	| Single Writes (records/secs) | Reads/Write	(records/secs) | Neighbors (records/secs) |
| --------| ------------- |-------------| ----------- | ---------- |
| Trueno	| 1306.3980  	  | 232.0369    | 201.4081    |	233.4742   |
| Neo4j	  | 4736.0138	    | 234.1537    | 2445.6290   |	10307.9885 |

<p align="left">
  <img height="600" src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/trueno_neo-performance-1.png">
</p>

## Single Reads
Read vertices (and all its properties).

|	GraphDB | Input (vertices)	| Throughput (records/secs) | 
| --------| ----------------- |-------------| 
| Trueno	| 10000             | 1306.39795  | 
| Neo4j	  | 20000             | 4735.013766 | 

**Neo4j** is **3.6 times faster** than Trueno reading.

## Single Writes
Create vertices. In case of Trueno, the load was reduced since the server could not handle more than 10000 vertices.

|	GraphDB | Input (vertices)	| Throughput (records/secs) | 
| --------| ----------------- |-------------| 
| Trueno	| 10000             | 232.036884  | 
| Neo4j	  | 20000             | 234.1536586 | 

**Neo4j** is **comparable** with **Trueno** writing.

## Reads/Writes
Retrieve a vertex, and set/update a property. In case of Trueno, the load was reduced since the server could not handle more than 5000 concurrent request for reads/writes. Also, Trueno needed two operations (calls) to accomplish this test instead of one (Neo4j)

|	GraphDB | Input (vertices)	| Throughput (records/secs) | 
| --------| ----------------- |-------------| 
| Trueno	| 10000             | 1306.39795  | 
| Neo4j	  | 20000             | 4735.013766 | 

**Neo4j** is **12 times faster** than Trueno reading/writing.

## Neighbors
Ask for all the direct neighbors of a vertex. In case of Trueno, the load was reduced since the server could not handle more than 500 concurrent request for neighbors. Also, Trueno needed two operations (calls) to accomplish this test instead of one (Neo4j)

|	GraphDB | Input (vertices)	| Throughput (records/secs) | 
| --------| ----------------- |-------------| 
| Trueno	| 500               | 233.47421   | 
| Neo4j	  | 20000             | 10307.98849 | 

**Neo4j** is **44 times faster** than Trueno finding the direct neighbors of vertices.

----------

# 3. Performance Benchmarks (Native client)

This benchmark compares the single read performance of the following configurations:

* **Trueno (REST)**. Current configuration, where data is retrieved from the ElasticSearch backend using a REST connection.
* **Trueno (Navite node.js)**. Trueno access ElasticSearch Backend via a tunelling bridge (socket), which establish a connection with the backend using a native driver (Java). 
* **Trueno (Native direct)**. Similar to the previous case, but the test retrieved the data from the ElasticSearch backend directly from the Bridge Server (Native ElasticSearch API), without using the Trueno websocket (basically, we bypassed Trueno). The connection does not incurr on pre-processing and post-processing done by Trueno. 
* **Neo4j**. Neo4j standalone configuration.

<p align="left">
  <img src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/trueno_neo-performance-3-native.png">
</p>

## Single Reads
Read vertices (and all its properties).

|	GraphDB | Input (vertices)	| Time (secs) | Throughput (records/secs) | 
| --------| ----------------- |------------ | -------------| 
| Trueno (REST)	          | 10000\*             | 53.18       |  187.9857    | 
| Trueno (Native node.js) | 10000\*             | 39.78       |  251.3170    | 
| Trueno (Native direct)	| 50000               | 40.38       |  1237.9181   | 
| Neo4j	                  | 50000               | 14.01       |  3570.9264   | 

\* *The test could not be performed using a larger dataset due a timeout on the connection.*

**Neo4j** is **3 times faster** than Trueno reading.

----------

# 4. Performance Benchmarks (Native client + web socket)

This benchmark compares the single read performance of the following configurations:

* **Trueno (REST)**. Current configuration, where data is retrieved from the ElasticSearch backend using a REST connection.
* **Trueno (Transport Client using Elasticsearch Native API)**. Trueno access ElasticSearch Backend via a tunelling bridge (written in Java), which establish a connection with the backend using a native driver (Java). The comunication between the client and the tuneeling bridge is done via web socket (which include less overhead than the traditional socket.io communication that was before). The transport client connects with the Elasticsearch backend via messages (using the Elasticsearch Native API).
* **Trueno (Native direct)**. Similar to the previous case, but the difference is that we use a Native Client instead of the Transport Client. A Native Client requires to instantiate a Elasticsearch node in the backend. Even thougth that this configuration is faster, is not recommended by Elasticsearch because in the long run will translate in more overhead to the backend. 
* **Neo4j**. Neo4j standalone configuration.

<p align="left">
  <img src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/trueno_neo-performance-4-native.png">
</p>

## Single Reads
Read vertices (and all its properties).

|	GraphDB | Input (vertices)	| Time (secs) | Throughput (records/secs) | 
| --------| ----------------- |------------ | -------------| 
| Trueno (REST)	                | 10000 \*     | 53.18       |  187.9857      | 
| **Trueno (Transport Client)** | **50000**    | **7.51**    |  **6656.2756** | 
| Trueno (Node Client)	        | 50000        |  5.76       |  8672.7523     | 
| Neo4j	                        | 50000        | 14.87       |  3362.1890     | 

\* *The test could not be performed using a larger dataset due a timeout on the connection.*

**Trueno** is **2 times faster** than Neo4J reading.


## Latest Results

### Film

| Test             |	GraphDB | Input (vertices)	| Time (secs) | Std Dev | Throughput (records/secs) | Std Dev | 
| ----------       | -------- | ----------------- |------------ | ------- | -------------| -------------- |
| Single Reads     | Trueno 	| 50000             | 13.066      | 3.485   | 3826.472     |  708.926       |
| Single Reads     | Neo4j    | 50000             | 18.278      | 0.817   | 2735.359     |  111.631       | 
| Single Writes    | Trueno   | 5000              | 1.722       | 0.755   | 2901.416     |  1005.418      |
| Single Writes    | Neo4j    | 5000              | 135.689     | 2.361   | 36.841       |  0.636         |  
| Single Reads+Write (90/10) | Trueno   |  50000  |  12.168     | 0.531   |  4108.709    |  169.100       |
| Single Reads+Write (90/10) | Neo4j    |  50000  |  25.870     | 0.338   |  1932.599    |  25.119        |

### Citation

| Test             |	GraphDB | Input (vertices)	| Time (secs) | Std Dev | Throughput (records/secs) | Std Dev | 
| ----------       | -------- | ----------------- |------------ | ------- | -------------| -------------- |
| Single Reads     | Trueno 	| 29554             | 6.8154      | 1.120   | 4336.033     |  638.157       | 
| Single Reads     | Neo4j    | 29554             | 5.7775      | 1.477   | 5187.623     |  858.942       |
| Single Writes    | Trueno   | 5000              | 1.0637      | 0.449   | 4697.750     |  2232.762      |
| Single Writes    | Neo4j    | 5000              | 161.547     | 1.562   | 30.944       |  0.298         |  
| Single Reads+Write (90/10) | Trueno   |  29554  |  6.905      | 0.409   |  4279.639    |  229.381       |
| Single Reads+Write (90/10) | Neo4j    |  29554  |  9.185      | 0.280   |  3217.221    |  93.660        |

### Biogrid

| Test             |	GraphDB | Input (vertices)	| Time (secs) | Std Dev | Throughput (records/secs) | Std Dev | 
| ----------       | -------- | ----------------- |------------ | ------- | -------------| -------------- |
| Single Reads     | Trueno 	| 15034             | 3.377       | 0.151   | 4450.580     |  199.569       | 
| Single Reads     | Neo4j    | 15034             | 3.247       | 0.929   | 4629.132     |  854.612       |
| Single Writes    | Trueno   | 5000              | 1.051       | 0.146   | 4752.477     |  564.303       |
| Single Writes    | Neo4j    | 5000              | 88.540      | 0.797   | 56.459       |  0.509         |  
| Single Reads+Write (90/10) | Trueno   |  15034  |  4.367      | 0.476   |  3442.051    |  363.237       |
| Single Reads+Write (90/10) | Neo4j    |  15034  |  5.857      | 4.992   |  2566.537    |  876.241       |

### Pokec

| Test             |	GraphDB | Input (vertices)	| Time (secs) | Std Dev | Throughput (records/secs) | Std Dev | 
| ----------       | -------- | ----------------- |------------ | ------- | -------------| -------------- |
| Single Reads     | Trueno 	| 50000             | 15.415      | 1.035   | 3243.288     |  210.091       | 
| Single Reads     | Neo4j    | 50000             | 19.087      | 0.227   | 2619.410     |  30.945        |
| Single Writes    | Trueno   | 5000              | 0.729       | 0.174   | 6853.291     |  1533.994      |
| Single Writes    | Neo4j    | 5000              | 162.509     | 2.352   | 30.761       |  0.449         |  
| Single Reads+Write (90/10) | Trueno   |  50000  |  17.596     | 1.873   |  2841.424    |  303.476       |
| Single Reads+Write (90/10) | Neo4j    |  50000  |  28.862     | 0.332   |  1228.288    |  19.822        |

<p align="left">
  <img src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/assets/images/performance_all_datasets.png">
</p>

----------

# 5. Batch Write Benchmarks

In this experiment, we inserted the movies dataset in batches of 300 components until completion. We ran separate inserts(for vertices and edges).

| GraphDB          | Minutes |
| ---------------- | ------- |
| Trueno           | 4.79    |
| Neo4j            | 13.27   |

<p align="left">
  <img height="600" src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/insert-edges.png">
</p>

| GraphDB          | Minutes |
| ---------------- | ------- |
| Trueno           | 11.08   |
| Neo4j            | 11.28   |

<p align="left">
  <img height="600" src="https://raw.githubusercontent.com/mastayoda/neo4j-benchmark/master/insert-vertices.png">
</p>


# References
* [1] https://neo4j.com/blog/using-apache-spark-neo4j-big-data-graph-analytics/
* [2] https://neo4j.com/developer/apache-spark/
* [3] https://neo4j.com/blog/neo4j-3-0-apache-spark-connector/

