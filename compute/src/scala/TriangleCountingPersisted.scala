/*
 ________                                                 _______   _______
/        |                                               /       \ /       \
$$$$$$$$/______   __    __   ______   _______    ______  $$$$$$$  |$$$$$$$  |
   $$ | /      \ /  |  /  | /      \ /       \  /      \ $$ |  $$ |$$ |__$$ |
   $$ |/$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$  |/$$$$$$  |$$ |  $$ |$$    $$<
   $$ |$$ |  $$/ $$ |  $$ |$$    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$$$$$$  |
   $$ |$$ |      $$ \__$$ |$$$$$$$$/ $$ |  $$ |$$ \__$$ |$$ |__$$ |$$ |__$$ |
   $$ |$$ |      $$    $$/ $$       |$$ |  $$ |$$    $$/ $$    $$/ $$    $$/
   $$/ $$/        $$$$$$/   $$$$$$$/ $$/   $$/  $$$$$$/  $$$$$$$/  $$$$$$$/
 */


/**      In God we trust
  * Created by: Servio Palacios on 2016.05.26.
  * Source: TirangleCountingPersisted.scala
  * Author: Servio Palacios
  * Last edited: 2016.06.01 13:55
  * Description: Spark Job Connector using REST API
  */

/**
  * Compute the number of triangles passing through each vertex.
  *
  * The algorithm is relatively straightforward and can be computed in three steps:
  *
  * <ul>
  * <li> Compute the set of neighbors for each vertex</li>
  * <li> For each edge compute the intersection of the sets and send the count to both vertices.</li>
  * <li> Compute the sum at each vertex and divide by two since each triangle is counted twice.</li>
  * </ul>
  *
  * There are two implementations.  The default `TriangleCount.run` implementation first removes
  * self cycles and canonicalizes the graph to ensure that the following conditions hold:
  * <ul>
  * <li> There are no self edges</li>
  * <li> All edges are oriented src > dst</li>
  * <li> There are no duplicate edges</li>
  * </ul>
  * However, the canonicalization procedure is costly as it requires repartitioning the graph.
  * If the input data is already in "canonical form" with self cycles removed then the
  * `TriangleCount.runPreCanonicalized` should be used instead.
  *
  * {{{
  * val canonicalGraph = graph.mapEdges(e => 1).removeSelfEdges().canonicalizeEdges()
  * val counts = TriangleCount.runPreCanonicalized(canonicalGraph).vertices
  * }}}
  *
  */

/* Package related to the Job Server */
package spark.jobserver

import com.typesafe.config.{Config, ConfigFactory}
import spark.jobserver.{SparkJob, SparkJobInvalid, SparkJobValid, SparkJobValidation}

import scala.util.Try

/* spark references */
import org.apache.spark.{SparkConf, SparkContext}
import com.datastax.spark.connector._

/* GraphX references */
import org.apache.spark.graphx._
import org.apache.spark.graphx.VertexRDD
import org.apache.spark.rdd.RDD


object TriangleCounting extends SparkJob {


  def main(args: Array[String]) {
    val conf = new SparkConf(true)
      .set("spark.cassandra.connection.host", "localhost")
      .setMaster("local[4]")
      .setAppName("ConnectedComponents")

    val sc = new SparkContext(conf)
    val config = ConfigFactory.parseString("")
    val results = runJob(sc, config)
    println("Result is " + results)
  }

  /* Validate incoming parameters */
  /* In here I use schemas to determine in which Graph I will run the algorithms */
  override def validate(sc: SparkContext, config: Config): SparkJobValidation = {
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
    val strComp = config.getString("comp.string")
    val strPersisted = config.getString("persisted.string")

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

    /* Collect result - Triangle Count */
    val triCounts = graph.triangleCount().vertices

    triCounts.collect()

  }//runJob



