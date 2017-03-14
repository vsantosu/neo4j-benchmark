/* Generated from Java with JSweet 1.2.0 - http://www.jsweet.org */
import ElasticClient = org.trueno.driver.lib.core.search.ElasticClient;

import CSVReader = com.opencsv.CSVReader;

import FileReader = java.io.FileReader;

/**
 * Created by Maverick-zhn on 7/20/16.
 */
class driver {
    public static main(args : string[]) {
        console.info("Calling Elastic Search...");
        let eClient : ElasticClient = new ElasticClient("trueno", "localhost");
        eClient.connect();
        let totalstartTime : number = java.lang.System.currentTimeMillis();
        let total : number = driver.bulk(eClient);
        let totalestimatedTime : number = java.lang.System.currentTimeMillis() - totalstartTime;
        console.info("Single Reads: " + (totalestimatedTime / 1000.0) + "s " + (totalestimatedTime) + "ms" + " " + total / (totalestimatedTime / 1000.0) + " records/s");
    }

    public static search(eClient : ElasticClient) : number {
        let csvFile : string = "/Users/victor/Desktop/neo4j-benchmark/elastic-search-java/src/main/java/directors-20000.csv";
        let reader : CSVReader = null;
        let total : number = 0;
        try {
            reader = new CSVReader(new FileReader(csvFile));
            let line : string[];
            while(((line = reader.readNext()) != null)){
                let q : string = "{\"term\":{\"prop.name\":\"" + line[1] + "\"}}";
                let results : string[] = eClient.search(q, "movies", "v", 1000);
                total++;
            };
        } catch(e) {
            console.error(e.message, e);
        };
        return total;
    }

    public static bulk(eClient : ElasticClient) : number {
        let total : number = 0;
        let operations : string[][] = [["index", "v", "3302", "{\"id\":3302,\"jobId\":null,\"label\":\"Film\",\"prop\":{\"id\":3302,\"filmId\":\"m.06_x8j_\",\"name\":\"Under U Cloud\",\"release_date\":\"1937-08-01\"},\"comp\":{},\"meta\":{},\"partition\":null }"], ["index", "v", "3303", "{\"id\":3303,\"jobId\":null,\"label\":\"Film\",\"prop\":{\"id\":3303,\"filmId\":\"m.06zmzms\",\"name\":\"Night Time in Nevada\",\"release_date\":\"1948-01-01\"},\"comp\":{},\"meta\":{},\"partition\":null  }"], ["delete", "v", "3004", ""], ["delete", "v", "3005", ""]];
        eClient.bulk("movies", operations);
        return total;
    }
}
driver["__class"] = "driver";




driver.main(null);
