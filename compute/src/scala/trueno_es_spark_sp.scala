
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
  * Source: ShortestPathBenchmark.scala
  * Author: Servio Palacios
  * Description: Spark Job Connector using REST API
  */

import org.apache.spark.SparkContext    
import org.apache.spark.SparkContext._

import org.elasticsearch.spark._
import org.elasticsearch.spark.rdd.EsSpark

/* GraphX references */
import org.apache.spark.graphx._
import org.apache.spark.graphx.lib._
import org.apache.spark.graphx.VertexRDD
import org.apache.spark.rdd.RDD

import org.apache.spark.SparkConf

val conf = new SparkConf()
              .setAppName("ConnectedComponentsES-Benchmark")
              .setMaster("local[4]")

/* ElasticSearch Configuration */
conf.set("es.nodes", "localhost")
conf.set("es.port", "9200")
conf.set("es.index.auto.create", "true")
conf.set("es.read.field.include", "id,label")
conf.set("es.field.read.empty.as.null", "true")

val sc = new SparkContext(conf)  

/* Read vertices from ES Benchmark */
val t0 = System.nanoTime()
val verticesESRDD = sc.esRDD("biogrid/v")
verticesESRDD.count()
val t1 = System.nanoTime()


/* Convert Read vertices from ES Benchmark */
val t2 = System.nanoTime()
val vertexRDD: RDD[(VertexId,Long)] = verticesESRDD.map(
         x=> (
           x._2.get("id").get.asInstanceOf[Long],
           x._2.get("id").get.asInstanceOf[Long]
         )
    )

val vertexSet = VertexRDD(vertexRDD)

val t3 = System.nanoTime()
/* END Convert Read vertices from ES Benchmark */

/* Read edges from ES Benchmark */
val t4 = System.nanoTime()

val edgesESRDD = sc.esRDD("biogrid/e")
edgesESRDD.count()

val t5 = System.nanoTime()
/* END Read edges from ES Benchmark */


/* Convert Read Edges from ES Benchmark */
val t6 = System.nanoTime()

val edgesRDD: RDD[Edge[Long]] = edgesESRDD.map(
  x=> (
    Edge(
    x._2.get("source").get.asInstanceOf[Long],
    x._2.get("target").get.asInstanceOf[Long]
    )
  )
)

val t7 = System.nanoTime()
/* END Convert Read Edges from ES Benchmark */

/* Build the initial Graph */
val t8 = System.nanoTime()
val graph = Graph(vertexSet, edgesRDD)
val t9 = System.nanoTime()
/* End Build the initial Graph */

/* Find the connected components */
val t10 = System.nanoTime()
val g2 = PageRank.runUntilConvergence(graph,0.001)
val t11 = System.nanoTime()

cc.collect()

println("Loading vertices from ES:        | " + (t1-t0))
println("Converting esRDD into VertexRDD  | " + (t3-t2))
println("Loading edges from ES:           | " + (t5-t4))
println("Converting esRDD into EdgeRDD    | " + (t7-t6))
println("Building the graph:              | " + (t9-t8))
println("Algorithm compute time:          | " + (t11-t10))


// val microbatches = mutable.Queue(verticesRDD)
// val dstream = ssc.queueStream(microbatches)

/* Write vertices to ES Benchmark */
// val t6 = System.nanoTime()
// verticesRDD.saveToEs("spark/vertices")
// val t7 = System.nanoTime()

/* Write edges to ES Benchmark */
// val t8 = System.nanoTime()
// edgesRDD.saveToEs("spark/edges")
// val t9 = System.nanoTime()

/* Write vertices to ES Benchmark */
// val t6 = System.nanoTime()
// EsSparkStreaming.saveToEs(dstream, "spark/streaming")
// ssc.start()  
// val t7 = System.nanoTime()

// println("Writing vertices to ES: " + (t7-t6) + "ns")
// println("Writing edges to ES: " + (t9-t8) + "ns")
//./bin/spark-shell --packages org.elasticsearch:elasticsearch-spark-20_2.11:5.1.1 -i spark-es.scala
//./bin/spark-shell --packages neo4j-contrib:neo4j-spark-connector:2.0.0-M2 -i biogrid.scala