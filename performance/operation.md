
## start cluster 
cd trueno && node lib/trueno.js start -h ${HOSTNAME} --cluster ~/cluster.json --forever

## neo browser (check clusters state)
 :play sysinfo 
 http://NEO4J-ADDRESS:7474/db/data/transaction/commit

## causal cluster 
http://byteus.tech/neo4j-causal-cluster-http-load-balancing/
https://dzone.com/articles/introducing-neo4j-31-now-in-beta-release
https://www.infoq.com/presentations/causal-clustering-neo4j

## neo4j scalability
http://info.neo4j.com/rs/neotechnology/images/Understanding%20Neo4j%20Scalability(2).pdf

## useful commands
```
curl -H "Content-Type: application/json" -X POST -d '{"password":"trueno"}' -u neo4j:neo4j http://localhost:7474/user/neo4j/password
```

```
curl -XPOST 'localhost:8004/pokec/e/_delete_by_query?routing=1&pretty' -H 'Content-Type: application/json' -d'
{
    "query": {
        "range": {
            "id": {
             "gte": 32000000   
            }
        }
    }
}
'
```

```
curl -XDELETE 'localhost:8004/pokec/e/_query?pretty' -H 'Content-Type: application/json' -d'
{
    "query": {
        "range": {
            "id": {
             "gte": 32000000   
            }
        }
    }
}
'
```
