package trueno

import org.apache.spark.storage.StorageLevel
import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark.SparkConf
import org.apache.spark.graphx._
import scala.language.postfixOps

import scala.io.Source._ //fromFile
import java.io.File
import java.io.PrintWriter

import org.apache.spark.graphx.Graph.graphToGraphOps
import org.apache.spark.rdd.RDD.rddToPairRDDFunctions

import org.apache.spark.internal.Logging
import scala.reflect.ClassTag



object Main {
  
  def main(args:Array[String]) { 
    
    //makeUndirectedEdgeList("/home/tyler/2016E")
    run()
    
  }
 

  def run(){
     val edgeFile = "/home/tyler/scalaedges2.txt"
     //val edgeFile = "/home/tyler/2016E.undirected"

    
    val conf = new SparkConf().setAppName("Simple Application").setMaster("local[2]")
    val sc = new SparkContext(conf)
    sc.setLogLevel("ERROR")
    
    val graph = GraphLoader.edgeListFile(sc, edgeFile, false, -1, StorageLevel.MEMORY_ONLY, StorageLevel.MEMORY_ONLY)
    
  
    val prr_cheb = pageRankCheb(graph, .5, 1e-5)
    val prr_reg = pageRankReg(graph, .5, 1e-5)

    prr_cheb.vertices.collect.foreach{case(vid, v) => println(v)}
    println("\n")
    prr_reg.vertices.collect.foreach{case(vid, v) => println(v)}
    
    sc.stop
    }
 
  
  def makeUndirectedEdgeList(fileName: String)={
    val lines = fromFile(fileName).getLines
    
    val tst = lines.map { e => e.split("\t") }
     

    val sorted = tst.map{e => e.sortBy{x => x.toLong}}.toSet
    val reverseEdges = sorted.map{e => e.reverse}
   
    
    val undirected : Set[Array[String]] = sorted.union(reverseEdges)
    val toPrint = undirected.map{x => x.mkString("\t")}  
    
    val writer = new PrintWriter(new File(fileName + ".undirected"))
    toPrint.foreach{x => writer.write(x + "\n") }
    writer.close
  }
 
  def deltaRank(G1: Graph[Double,Double], G2: VertexRDD[Double]):  Double ={
   val diffGraph =  G1.outerJoinVertices(G2)((vid, rank, otherRank) => rank-otherRank.get)
   val total = diffGraph.vertices.values.collect.reduceLeft( (_).abs+(_).abs)
   println(total)
   total
  }
  
  def pageRankCheb[VD: ClassTag, ED: ClassTag](graph: Graph[VD, ED], resetProb: Double=.15, tol: Double=1e-10): Graph[Double, Double] ={

    val numNodes = graph.vertices.count()
    
    var rankGraph: Graph[Double, Double] = graph
       // Associate the degree with each vertex
      .outerJoinVertices(graph.outDegrees) { (vid, vdata, deg) => deg.getOrElse(0) }
      // Set the weight on the edges based on the degree
       .mapTriplets( e => (1.0 / e.srcAttr))// .mapTriplets( e => (1-resetProb) / e.srcAttr)
      // Set the vertex attributes to the initial pagerank values
      .mapVertices { (id, attr) => 1.0/numNodes }
    
    
       
    //Cheb things
    var mu:Array[Double] = Array(1.0, 1/(1-resetProb), 0.0)
   
    var iterations = 0
    var diff = 1.0
    
    var ranks2 = rankGraph.mapVertices{(id, attr) => 0.0}
    var ranks1 = rankGraph
    var ranks0 = rankGraph.mapVertices{(id, attr) => 0.0}
    
    while (diff  > tol) {
      mu(2) = (2.0 / (1.0 - resetProb) * mu(1) - mu(0)) 
      
      var dotProd = ranks1.aggregateMessages[Double](
        ctx => ctx.sendToDst(ctx.srcAttr * ctx.attr), _ + _ )

      val dotG = ranks1.outerJoinVertices(dotProd)((vid, oldv, newv)=> (newv.getOrElse(0.0) ))
        
      ranks2 = ranks0.outerJoinVertices(dotG.vertices) {
        (id, oldRank, dotG ) => 
            (2.0 * (mu(1) / mu(2)) * dotG.getOrElse(0.0)/*._1*/) -
            ((mu(0) / mu(2)) * oldRank) +
            ((2.0 * mu(1)) / ((1.0 - resetProb) * mu(2)) * resetProb * (1.0/numNodes))
   
      }//.cache()

      diff = deltaRank(ranks2, ranks1.vertices)
         
      iterations += 1
      mu(0) = mu(1)
      mu(1) = mu(2)
      ranks0 = ranks1
      ranks1 = ranks2      
    }
       
    println("Converged in " + iterations + " Iterations")

    ranks2
  }
 
  def pageRankReg[VD: ClassTag, ED: ClassTag](graph: Graph[VD, ED], resetProb: Double=.15, tol: Double=1e-10): Graph[Double, Double] ={
    val numNodes = graph.vertices.count()
    
    var rankGraph: Graph[Double, Double] = graph
       // Associate the degree with each vertex
      .outerJoinVertices(graph.outDegrees) { (vid, vdata, deg) => deg.getOrElse(0) }
      // Set the weight on the edges based on the degree
      .mapTriplets( e => (1.0 / e.srcAttr))//, TripletFields.Src )
      // Set the vertex attributes to the initial pagerank values
      .mapVertices { (id, attr) => 1.0/numNodes }
    
    var iterations = 0
    var diff = 1.0
    var prevRankGraph: Graph[Double, Double] = null
    while (diff  > tol) {
      rankGraph.cache()
      

      // Compute the outgoing rank contributions of each vertex, perform local preaggregation, and
      // do the final aggregation at the receiving vertices. Requires a shuffle for aggregation.
      val rankUpdates = rankGraph.aggregateMessages[Double](
        ctx => ctx.sendToDst(ctx.srcAttr * ctx.attr), _ + _ )//, TripletFields.Src)//fromnode * edgeweight

      // Apply the final rank updates to get the new ranks, using join to preserve ranks of vertices
      // that didn't receive a message. Requires a shuffle for broadcasting updated ranks to the
      // edge partitions.
      prevRankGraph = rankGraph
      
      
      rankGraph = rankGraph.joinVertices(rankUpdates) {
        (id, oldRank, msgSum) => resetProb/numNodes + (1.0 - resetProb) * msgSum // () + not reset*computed
      }.cache()

      iterations += 1
      diff = deltaRank(rankGraph, prevRankGraph.vertices)
    }
       
    println("Converged in " + iterations + " Iterations")

    rankGraph
  }
   
  


  
}