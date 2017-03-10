/* Generated from Java with JSweet 1.2.0 - http://www.jsweet.org */
namespace org.trueno.driver.lib.core.search {
    import BulkRequestBuilder = org.elasticsearch.action.bulk.BulkRequestBuilder;

    import BulkResponse = org.elasticsearch.action.bulk.BulkResponse;

    import SearchResponse = org.elasticsearch.action.search.SearchResponse;

    import SearchType = org.elasticsearch.action.search.SearchType;

    import TransportClient = org.elasticsearch.client.transport.TransportClient;

    import Settings = org.elasticsearch.common.settings.Settings;

    import InetSocketTransportAddress = org.elasticsearch.common.transport.InetSocketTransportAddress;

    import SearchHit = org.elasticsearch.search.SearchHit;

    import InetAddress = java.net.InetAddress;

    import InetSocketAddress = java.net.InetSocketAddress;

    import PrintStream = java.io.PrintStream;

    import ArrayList = java.util.ArrayList;

    /**
     * Created by Victor, edited by Servio on 2017.02.18.
     */
    export class ElasticClient {
        private client : TransportClient;

        private clusterName : string;

        private addresses : string[];

        public constructor(clusterName : string, addresses : string) {
            this.clusterName = clusterName;
            this.addresses = addresses.split(",");
        }

        public connect() {
            try {
                let settings : Settings = Settings.settingsBuilder().put("cluster.name", this.clusterName).build();
                this.client = TransportClient.builder().settings(settings).build();
                for(let index121=0; index121 < this.addresses.length; index121++) {
                    let addr = this.addresses[index121];
                    {
                        this.client.addTransportAddress(new InetSocketTransportAddress(new InetSocketAddress(InetAddress.getByName(addr), 9300)));
                    }
                }
            } catch(e) {
                console.info(e);
            };
        }

        public search(q : string, index : string, type : string, size : number) : string[] {
            try {
                let totalstartTime : number = java.lang.System.currentTimeMillis();
                let resp : SearchResponse = this.client.prepareSearch(index).setTypes(type).setSearchType(SearchType.DFS_QUERY_THEN_FETCH).setSize(size).setQuery(q).get();
                let results : SearchHit[] = resp.getHits().getHits();
                let sources : ArrayList<string> = <any>(new ArrayList<string>());
                for(let index122=0; index122 < results.length; index122++) {
                    let h = results[index122];
                    {
                        sources.add(h.getSourceAsString());
                    }
                }
                let fResults : string[] = sources.toArray<any>(new Array(sources.size()));
                let totalestimatedTime : number = java.lang.System.currentTimeMillis() - totalstartTime;
                return fResults;
            } catch(e) {
                console.error(e.message, e);
            };
            return null;
        }

        public bulk(index : string, operations : string[][]) : string {
            try {
                console.info("index: " + index);
                let totalstartTime : number = java.lang.System.currentTimeMillis();
                let bulkRequest : BulkRequestBuilder = this.client.prepareBulk();
                for(let index123=0; index123 < operations.length; index123++) {
                    let info = operations[index123];
                    {
                        if((info[0] === "index")) {
                            bulkRequest.add(this.client.prepareIndex(index, info[1], info[2]).setSource(info[3]));
                            console.info(index + " " + info[0] + " " + info[1] + " " + info[2] + " " + info[3]);
                        } else if((info[0] === "delete")) {
                            bulkRequest.add(this.client.prepareDelete(index, info[1], info[2]));
                            console.info(index + " " + info[0] + " " + info[1] + " " + info[2] + " " + info[3]);
                        }
                    }
                }
                let bulkResponse : BulkResponse = bulkRequest.get();
                let totalestimatedTime : number = java.lang.System.currentTimeMillis() - totalstartTime;
                console.info("time ms: " + totalestimatedTime);
                if(bulkResponse.hasFailures()) {
                    return bulkResponse.buildFailureMessage();
                } else {
                    return "";
                }
            } catch(e) {
                console.error(e.message, e);
            };
            return null;
        }
    }
    ElasticClient["__class"] = "org.trueno.driver.lib.core.search.ElasticClient";

}

