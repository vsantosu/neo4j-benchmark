
import org.elasticsearch.action.ListenableActionFuture;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.transport.TransportClient;
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


    public static void main(String args[]) {

        System.out.println("Calling Elastic Search...");

         /* instantiate Search driver */
        final ElasticClient eClient = new ElasticClient("trueno", "localhost");

        /* try to connect */
        eClient.connect();

        /* csv read */
        String csvFile = "/Users/victor/Desktop/neo4j-benchmark/elastic-search-java/src/main/java/directors-20000.csv";
        CSVReader reader = null;

        long totalstartTime = System.currentTimeMillis();
        double total = 0;

        try {
            reader = new CSVReader(new FileReader(csvFile));
            String[] line;

           // String q = "{\"term\":{\"prop.name\":\"" + "Fantasy Fights 7 & 8" + "\"}}";

            while ((line = reader.readNext()) != null) {

                String q = "{\"term\":{\"prop.name\":\"" + line[1] + "\"}}";

                /* search */
                SearchHit[] results = eClient.search(q, "movies", "v", 1000);

//                for(SearchHit hit : results){
//
//                    String sourceAsString = hit.getSourceAsString();
//                    if (sourceAsString != null) {
//                        System.out.println(sourceAsString);
//                    }
//                }

                total++;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        long totalestimatedTime = System.currentTimeMillis() - totalstartTime;
        System.out.println("Single Reads: " + (totalestimatedTime / 1000.0) + "s " + (totalestimatedTime) + "ms" + " " + total / (totalestimatedTime / 1000.0) + " records/s");


    }//main
}//driver

