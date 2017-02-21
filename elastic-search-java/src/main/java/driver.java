
import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.ListenableActionFuture;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.trueno.driver.lib.core.search.ElasticClient;
import org.trueno.driver.lib.core.search.Callback;
import com.opencsv.CSVReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.concurrent.Semaphore;

/**
 * Created by Maverick-zhn on 7/20/16.
 */
public class driver {


    private static final Semaphore available = new Semaphore(10, true);


    public static void main(String args[]){

        System.out.println("Calling Elastic Search...");

         /* instantiate Search driver */
        final ElasticClient eClient  = new ElasticClient("trueno", "localhost");

        /* try to connect */
        eClient.connect(new Callback() {
            public void method(Object rClient) {

                /* type cast client */
                TransportClient client = (TransportClient)rClient;
                /* csv read */
                String csvFile = "/Users/victor/Desktop/neo4j-benchmark/elastic-search-java/src/main/java/directors-5000.csv";
                CSVReader reader = null;

                long totalstartTime = System.currentTimeMillis();
                double total = 0;

                try {
                    reader = new CSVReader(new FileReader(csvFile));
                    String[] line;

                    /* list of futures */
                    ArrayList<ListenableActionFuture<SearchResponse>> futureList =  new ArrayList<ListenableActionFuture<SearchResponse>>();


                    while ((line = reader.readNext()) != null) {

                        String q = "{\"term\":{\"prop.name\":\""+ "Fantasy Fights 7 & 8" +"\"}}";

                        /* search */
                        ListenableActionFuture<SearchResponse> asyncResp  = eClient.search(q, "movies", "v", 1000, new Callback() {
                            @Override
                            public void method(Object rResults) {
                                /* cast array */
                                SearchHit[] results = (SearchHit[])rResults;

                               // System.out.println(results.length);
                                /* iterate results */
//                                for(SearchHit hit : results){
//
//                                    String sourceAsString = hit.getSourceAsString();
//                                    if (sourceAsString != null) {
//                                        System.out.println(sourceAsString);
//                                    }
//                                }
                            }
                        }, new Callback() {
                            @Override
                            public void method(Object error) {
                                System.out.println(error);
                            }
                        });
                        /* add future list */
                        futureList.add(asyncResp);

                        //QueryBuilders.queryStringQuery()

//                        SearchRequestBuilder query = client.prepareSearch("movies")
//                                .setTypes("v")
//                                .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
//                                .setQuery(q);
//                               // .setQuery(QueryBuilders.termQuery("prop.name",line[1]));
//
//
//                        long startTime = System.currentTimeMillis();
//
//
//                        ListenableActionFuture<SearchResponse> asyncResp =  query.execute();
//
//                        /* adding to future list */
//                        futureList.add(asyncResp);
//
//                        asyncResp.addListener(new ActionListener<SearchResponse>() {
//                            @Override
//                            public void onResponse(SearchResponse searchResponse) {
//                               //System.out.println("finish");
//                            }
//                            @Override
//                            public void onFailure(Throwable throwable) {
//
//                            }
//                        });

//                        long estimatedTime = System.currentTimeMillis() - startTime;
//                        System.out.println("Execution time: "+ (estimatedTime) + "ms");
                    }


                    /* wait for all of them */
                    for(ListenableActionFuture<SearchResponse> r : futureList ){
                        r.get();
                        total++;
                    }


                } catch (Exception e) {
                    e.printStackTrace();
                }

                long totalestimatedTime = System.currentTimeMillis() - totalstartTime;
                System.out.println("Single Reads: "+ (totalestimatedTime/1000.0) +"s "+ (totalestimatedTime) + "ms" + " " + total/(totalestimatedTime/1000.0) +" records/s");

//
//                SearchHit[] results = response.getHits().getHits();
//                for(SearchHit hit : results){
//
//                    String sourceAsString = hit.getSourceAsString();
//                    if (sourceAsString != null) {
//                        System.out.println(sourceAsString);
//                    }
//                }

            }
        }, new Callback() {
            public void method(Object error) {
                System.out.println("Disconnected");

            }
        });

    }//main
}//driver

