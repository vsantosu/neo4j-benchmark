/* Generated from Java with JSweet 1.2.0 - http://www.jsweet.org */
var org;
(function (org) {
    var trueno;
    (function (trueno) {
        var driver;
        (function (driver) {
            var lib;
            (function (lib) {
                var core;
                (function (core) {
                    var search;
                    (function (search) {
                        var SearchType = org.elasticsearch.action.search.SearchType;
                        var TransportClient = org.elasticsearch.client.transport.TransportClient;
                        var Settings = org.elasticsearch.common.settings.Settings;
                        var InetSocketTransportAddress = org.elasticsearch.common.transport.InetSocketTransportAddress;
                        var InetAddress = java.net.InetAddress;
                        var InetSocketAddress = java.net.InetSocketAddress;
                        var ArrayList = java.util.ArrayList;
                        /**
                         * Created by Victor, edited by Servio on 2017.02.18.
                         */
                        var ElasticClient = (function () {
                            function ElasticClient(clusterName, addresses) {
                                this.clusterName = clusterName;
                                this.addresses = addresses.split(",");
                            }
                            ElasticClient.prototype.connect = function () {
                                try {
                                    var settings = Settings.settingsBuilder().put("cluster.name", this.clusterName).build();
                                    this.client = TransportClient.builder().settings(settings).build();
                                    for (var index121 = 0; index121 < this.addresses.length; index121++) {
                                        var addr = this.addresses[index121];
                                        {
                                            this.client.addTransportAddress(new InetSocketTransportAddress(new InetSocketAddress(InetAddress.getByName(addr), 9300)));
                                        }
                                    }
                                }
                                catch (e) {
                                    console.info(e);
                                }
                                ;
                            };
                            ElasticClient.prototype.search = function (q, index, type, size) {
                                try {
                                    var totalstartTime = java.lang.System.currentTimeMillis();
                                    var resp = this.client.prepareSearch(index).setTypes(type).setSearchType(SearchType.DFS_QUERY_THEN_FETCH).setSize(size).setQuery(q).get();
                                    var results = resp.getHits().getHits();
                                    var sources = (new ArrayList());
                                    for (var index122 = 0; index122 < results.length; index122++) {
                                        var h = results[index122];
                                        {
                                            sources.add(h.getSourceAsString());
                                        }
                                    }
                                    var fResults = sources.toArray(new Array(sources.size()));
                                    var totalestimatedTime = java.lang.System.currentTimeMillis() - totalstartTime;
                                    return fResults;
                                }
                                catch (e) {
                                    console.error(e.message, e);
                                }
                                ;
                                return null;
                            };
                            ElasticClient.prototype.bulk = function (index, operations) {
                                try {
                                    console.info("index: " + index);
                                    var totalstartTime = java.lang.System.currentTimeMillis();
                                    var bulkRequest = this.client.prepareBulk();
                                    for (var index123 = 0; index123 < operations.length; index123++) {
                                        var info = operations[index123];
                                        {
                                            if ((info[0] === "index")) {
                                                bulkRequest.add(this.client.prepareIndex(index, info[1], info[2]).setSource(info[3]));
                                                console.info(index + " " + info[0] + " " + info[1] + " " + info[2] + " " + info[3]);
                                            }
                                            else if ((info[0] === "delete")) {
                                                bulkRequest.add(this.client.prepareDelete(index, info[1], info[2]));
                                                console.info(index + " " + info[0] + " " + info[1] + " " + info[2] + " " + info[3]);
                                            }
                                        }
                                    }
                                    var bulkResponse = bulkRequest.get();
                                    var totalestimatedTime = java.lang.System.currentTimeMillis() - totalstartTime;
                                    console.info("time ms: " + totalestimatedTime);
                                    if (bulkResponse.hasFailures()) {
                                        return bulkResponse.buildFailureMessage();
                                    }
                                    else {
                                        return "";
                                    }
                                }
                                catch (e) {
                                    console.error(e.message, e);
                                }
                                ;
                                return null;
                            };
                            return ElasticClient;
                        }());
                        search.ElasticClient = ElasticClient;
                        ElasticClient["__class"] = "org.trueno.driver.lib.core.search.ElasticClient";
                    })(search = core.search || (core.search = {}));
                })(core = lib.core || (lib.core = {}));
            })(lib = driver.lib || (driver.lib = {}));
        })(driver = trueno.driver || (trueno.driver = {}));
    })(trueno = org.trueno || (org.trueno = {}));
})(org || (org = {}));
