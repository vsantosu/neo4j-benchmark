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
  * Created by: Servio Palacios on 2016.09.19.
  * Source: TruenoPRPersist.scala
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

/* spark references */
import org.apache.spark.{SparkConf, SparkContext}
import com.datastax.spark.connector._

/* GraphX references */
import org.apache.spark.graphx._
import org.apache.spark.graphx.VertexRDD
import org.apache.spark.rdd.RDD
import com.datastax.spark.connector.UDTValue

import java.io._

object PageRankPersisted2 extends SparkJob {

  case class Compute(id: String, comp: Map[String, Map[String, UDTValue]])

  def main(args: Array[String]) {

    val config = ConfigFactory.parseString("")
    val strHost = config.getString("host.string")
    val strPort = config.getString("port.string")

    val conf = new SparkConf(true)
      .set("spark.cassandra.connection.host", strHost + ",127.0.0.1")
      .set("spark.cassandra.connection.port", strPort)
      .setMaster("local[4]")
      .setAppName("TruenoPRPersisted")

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

    Try(config.getString("alpha.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No alpha.string config param"))

    Try(config.getString("tolerance.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No tolerance.string config param"))

    Try(config.getString("comp.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No comp.string config param"))

    Try(config.getString("persisted.string"))
      .map(x => SparkJobValid)
      .getOrElse(SparkJobInvalid("No persisted.string config param"))
  }

  override def runJob(sc: SparkContext, config: Config): Any = {

    /* Received Parameters */
    val schema = config.getString("schema.string")
    val strVerticesTable = config.getString("vertices.string")
    val strEdgesTable = config.getString("edges.string")
    val strVertexId = config.getString("vertexId.string")
    val strSource = config.getString("source.string")
    val strTarget = config.getString("target.string")
    val alpha = config.getDouble("alpha.string")
    val tolerance = config.getDouble("tolerance.string")
    val strComp = config.getString("comp.string")
    val strPersisted = config.getString("persisted.string")

    /* Read from Cassandra Benchmark */
    val t0 = System.nanoTime()

    /* Get table from keyspace and stored as rdd */
    val vertexRDD1: RDD[(VertexId, String)] = sc.cassandraTable(schema, strVerticesTable)

    /* Get Cassandra Row and Select id */
    val vertexCassandra: RDD[CassandraRow] = sc.cassandraTable(schema, strVerticesTable)
      .select(strVertexId)

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

    val t1 = System.nanoTime()

    /* Build the initial Graph */
    val graph = Graph(vertexSet, edgesRDD)

    /* Run PageRank until convergence*/
    val t2 = System.nanoTime()

    val pageRank = graph.pageRank(tolerance).cache()
    val ranks = pageRank.vertices

    val t3 = System.nanoTime()
    //val ranks = graph.pageRank(TOL).vertices
    val temp = pageRank.vertices.count()

    val cassandraTime = "Loading data into cassandra: " + (t1-t0) + "ns"
    val computeTime = "PageRank computation: " + (t3-t2) + "ns"

    println("Loading data into cassandra: " + (t1-t0) + "ns")
    println("PageRank computation: " + (t3-t2) + "ns")

    val pw = new PrintWriter(new File("benchXYZ"))
    pw.write(cassandraTime)
    pw.write(computeTime)
    pw.close()

    if(strPersisted == "true") {
      ranks.collect()
      ranks.map(x =>
        Compute(
          x._1.toString,
          Map("PageRank" -> Map("result" -> UDTValue.fromMap(
            Map("type" -> "number",
              "value" -> x._2.toString)
          )))
        )

      ).saveToCassandra(schema, strVerticesTable, SomeColumns(strVertexId, strComp))

    }//if
    else {
      ranks.collect()
    }
  }//runJob

}//TruenoPRPersisted object



