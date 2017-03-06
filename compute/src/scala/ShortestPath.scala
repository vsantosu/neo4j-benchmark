/*

 ________                                                 _______   _______
/        |                                               /       \ /       \
$$$$$$$$/______   __    __   ______   _______    ______  $$$$$$$  |$$$$$$$  |
   $$ | /      \ / /|  / /| /      \ /       \  /      \ $$ |  $$ |$$ |__$$ |
   $$ |/$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$  |/$$$$$$  |$$ |  $$ |$$    $$<
   $$ |$$ |  $$/ $$ |  $$ |$$    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$$$$$$  |
   $$ |$$ |      $$ \__$$ |$$$$$$$$/ $$ |  $$ |$$ \__$$ |$$ |__$$ |$$ |__$$ |
   $$ |$$ |      $$    $$/ $$       |$$ |  $$ |$$    $$/ $$    $$/ $$    $$/
   $$/ $$/        $$$$$$/   $$$$$$$/ $$/   $$/  $$$$$$/  $$$$$$$/  $$$$$$$/

 */

/**      In God we trust
  * Created by: Servio Palacios on 2016.11.04.
  * Source: ShortestPath.scala
  * Author: Servio Palacios
  * Description: Spark Job Connector using REST API
  */

/**
  * Run a dynamic version of PageRank returning a graph with vertex attributes containing the
  * PageRank and edge attributes containing the normalized edge weight.
  * Results persisted to Cassandra Backend if indicated.
  *
  *  graph the graph on which to compute PageRank
  *  tol the tolerance allowed at convergence (smaller => more accurate).
  *  resetProb the random reset probability (alpha)
  *
  * @return the graph containing with each vertex containing the PageRank and each edge
  *         containing the normalized weight.
  */

/* Package related to the Job Server */
package spark.jobserver

import com.typesafe.config.{Config, ConfigFactory}
import scala.util.Try

/* Spark references */
import org.apache.spark.{SparkConf, SparkContext}
import com.datastax.spark.connector._

/* GraphX references */
import org.apache.spark.graphx._
import org.apache.spark.graphx.VertexRDD
import org.apache.spark.graphx.lib.ShortestPaths
import org.apache.spark.rdd.RDD
import com.datastax.spark.connector.UDTValue

object ShortestPath extends SparkJob {

  case class Compute(id: String, comp: Map[String, Map[String, UDTValue]])

  def main(args: Array[String]) {

    val config = ConfigFactory.parseString("")
    val strHost = config.getString("host.string")
    val strPort = config.getString("port.string")

    val conf = new SparkConf(true)
      .set("spark.cassandra.connection.host", strHost)
      .set("spark.cassandra.connection.port", strPort)
      .setMaster("local[4]")
      .setAppName("ShortestPath")

    val sc = new SparkContext(conf)

    val results = runJob(sc, config)
    println("Result is " + results)
  }

  /* Validate incoming parameters */
  /* In here I use schemas to determine in which Graph I will run the algorithms on*/
  override def validate(sc: SparkContext, config: Config): SparkJobValidation = {
    Try(config.getString("host.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No host.string config param"))

    Try(config.getString("port.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No port.string config param"))

    Try(config.getString("schema.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No schema.string config param"))

    Try(config.getString("vertices.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No vertices.string config param"))

    Try(config.getString("edges.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No edges.string config param"))

    Try(config.getString("vertexId.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No vertexId.string config param"))

    Try(config.getString("source.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No source.string config param"))

    Try(config.getString("target.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No target.string config param"))

    Try(config.getString("origin.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No origin.string config param"))

    Try(config.getString("destination.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No destination.string config param"))
  }

  override def runJob(sc: SparkContext, config: Config): Any = {

    /* Received Parameters */
    val schema = config.getString("schema.string")
    val strVerticesTable = config.getString("vertices.string")
    val strEdgesTable = config.getString("edges.string")
    val strSource = config.getString("source.string")
    val strTarget = config.getString("target.string")
    val strOrigin = config.getString("origin.string")
    val strDestination = config.getString("destination.string")

    /* Get table from keyspace and stored as rdd */
    val vertexRDD1: RDD[(VertexId, String)] = sc.cassandraTable(schema, strVerticesTable)

    /* Convert Cassandra Row into Spark's RDD */
    val rowsCassandra: RDD[CassandraRow] = sc.cassandraTable(schema, strEdgesTable)
      .select(strSource, strTarget)

    /* Convert RDD into edgeRDD */
    val edgesRDD: RDD[Edge[Int]] = rowsCassandra.map(x =>
      Edge(
        x.getLong(strSource),
        x.getLong(strTarget)
      ))

    val vertexSet = VertexRDD(vertexRDD1)

    /* Build the initial Graph */
    val graph = Graph(vertexSet, edgesRDD)

    val vidDestination: VertexId = strDestination.toLong
    val vidOrigin: VertexId = strOrigin.toLong

    val result = ShortestPaths.run(graph, Seq(vidDestination))

    val shortestPath = result               // result is a graph
      .vertices                             // we get the vertices RDD
      .filter({case(vId, _) => vId == vidOrigin})  // we filter to get only the shortest path from v1
      .first                                // there's only one value
      ._2                                   // the result is a tuple (v1, Map)
      .get(vidDestination)                              // we get its shortest path to v2 as an Option object

  }//runJob

}//TruenoPRPersisted object





