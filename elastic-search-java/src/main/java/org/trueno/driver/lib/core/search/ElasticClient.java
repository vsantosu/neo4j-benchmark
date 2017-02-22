package org.trueno.driver.lib.core.search;

import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;

/**
 * Created by Victor, edited by Servio on 2017.02.18.
 */
public class ElasticClient {

    /* Private properties */
    private TransportClient client;
    private String clusterName;
    private String[] addresses;

    public ElasticClient(String clusterName, String addresses) {
        /* set cluster name and addresses */
        this.clusterName = clusterName;
        this.addresses = addresses.split(",");
    }

    /* connect to elasticsearch using transport client */
    public void connect() {

        try{
            /* prepare cluster settings */
            Settings settings = Settings.settingsBuilder()
                    .put("cluster.name", this.clusterName)
                    .build();
            /* instantiate transport build */
            this.client = TransportClient.builder().settings(settings).build();

            /* set addresses */
            for(String addr: this.addresses){
                this.client.addTransportAddress(new InetSocketTransportAddress(new InetSocketAddress( InetAddress.getByName(addr), 9300)));
            }

        }catch (Exception e){
           System.out.println(e);
        }
    }

    /* connect to elasticsearch using transport client */
    public String[] search(String q, String index, String type, int size) {

        try{

            // System.out.println("q: " + q);
            // System.out.println("index: " + index);
            // System.out.println("type: " + type);
            // System.out.println("size: " + size);
            
            // System.out.println("clusterName: " + this.clusterName);
            // System.out.println("addresses: " + this.addresses[0]);
            // System.out.println("client: " + this.client);

            long totalstartTime = System.currentTimeMillis();

            /* build query */
           SearchResponse resp =  this.client.prepareSearch(index)
                    .setTypes(type)
                    .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                    .setSize(size)
                    .setQuery(q).get();

            SearchHit[] results = resp.getHits().getHits();
            ArrayList<String> sources = new ArrayList<String>();

            for(SearchHit h: results){
                sources.add(h.getSourceAsString());
            }

            String[] fResults = sources.toArray(new String[sources.size()]);

            long totalestimatedTime = System.currentTimeMillis() - totalstartTime;
            // System.out.println("time ms: " + totalestimatedTime);

            /* returning array of strings */
            return fResults;

        }catch (Exception e){
            e.printStackTrace(new PrintStream(System.out));
        }

        return null;
    }


}

