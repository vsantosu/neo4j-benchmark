package org.trueno.driver.lib.core.search;

import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.ListenableActionFuture;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.index.query.QueryBuilders;

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
    public void connect(final Callback connCallback, final Callback discoCallback) {

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
            /* return callback */
            connCallback.method(this.client);

        }catch (Exception e){
            discoCallback.method(e);
        }
    }

    /* connect to elasticsearch using transport client */
    public ListenableActionFuture<SearchResponse> search(String q, String index, String type, int size, final Callback resultCallback, final Callback errorCallback) {

        ListenableActionFuture<SearchResponse> r = null;

        try{
            /* build query */
            SearchRequestBuilder query = this.client.prepareSearch(index)
                    .setTypes(type)
                    .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                    .setSize(size)
                    .setQuery(q);

            /* execute search query */
            r = query.execute();
            /* execute search query */
            r.addListener(new ActionListener<SearchResponse>() {
                @Override
                public void onResponse(SearchResponse searchResponse) {
                    resultCallback.method(searchResponse.getHits().getHits());
                }
                @Override
                public void onFailure(Throwable throwable) {
                    errorCallback.method(throwable);
                }
            });

        }catch (Exception e){
            errorCallback.method(e);
        }
        return r;
    }


}

