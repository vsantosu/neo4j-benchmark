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
  * Created by: Servio Palacios on 2017.02.20.
  * Source: film.scala
  * Author: Servio Palacios
  * Description: Benchmark Film.db dataset from Neo4j
  */

/**
  * Benchmark Film.db dataset form Neo4j
  *
  * @return the graph containing with each vertex containing the PageRank and each edge
  *         containing the normalized weight.
  */

/* spark references */
import org.neo4j.spark._
import org.apache.spark.graphx._
import org.apache.spark.graphx.lib._

/* benchmarking neo4j load */
val t0 = System.nanoTime()  
val g = Neo4jGraph.loadGraph(sc, label1="Film", relTypes=Seq("GENRE"),  label2="Genre")
val t1 = System.nanoTime()

println("Load Graph from Neo4j Elapsed time: " + (t1 - t0) + "ns")

g.vertices.count
g.edges.count

/* benchmarking PageRank */
val t2 = System.nanoTime()  
val g2 = PageRank.run(g,20)
val t3 = System.nanoTime()

println("PageRank Elapsed time: " + (t3 - t1) + "ns")

val v = g2.vertices.take(10)
