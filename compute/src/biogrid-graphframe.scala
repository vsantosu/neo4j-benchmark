import org.neo4j.spark._

val t0 = System.nanoTime()  
val gdf = Neo4jGraphFrame.fromGraphX(sc,"Vertex",Seq("INTERACTION"),"Vertex")
//val g = Neo4jGraph.loadGraph(sc, label1="Vertex", relTypes=Seq("INTERACTION"),  label2="Vertex")
val t1 = System.nanoTime()

gdf.vertices.count 
gdf.edges.count  

val t2 = System.nanoTime()  
val results = gdf.pageRank.resetProbability(0.15).maxIter(10).run
val t3 = System.nanoTime()

results.vertices.take(10)

println("Load GraphFrame from Neo4j Elapsed time: " + (t1 - t0) + "ns")
println("PageRank (BioGrid) Elapsed time: " + (t3 - t1) + "s")