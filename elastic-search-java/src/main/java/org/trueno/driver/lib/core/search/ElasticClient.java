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
    public SearchHit[] search(String q, String index, String type, int size) {

        try{
            /* build query */
           SearchResponse resp =  this.client.prepareSearch(index)
                    .setTypes(type)
                    .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                    .setSize(size)
                    .setQuery(q).get();

            return resp.getHits().getHits();

        }catch (Exception e){
            System.out.println(e);
        }
        return null;
    }


}

