
###Spark Job Client

####Initiating Job Server
```
cd ~/spark-jobserver/

sbt
job-server/reStart
```

####Generating jars
```
cd /home/maverick/Desktop/repos/spark-jobserver/
sbt package
```

###Before uploading job
```
cd /home/maverick/Desktop/repos/spark-jobserver/job-server-tests/target/scala-2.10


curl --data-binary @jalgorithms.jar localhost:8090/jars/algorithms

```

####Testing pagerank
```
curl -d "input.string = a b c a b" 'localhost:8090/jobs?appName=algorithms&classPath=spark.jobserver.PageRank'
{
  "status": "STARTED",
  "result": {
    "jobId": "b1697a2e-189d-4735-9642-83262958f122",
    "context": "56501fa1-spark.jobserver.PageRank"
  }
}
```

####Classes
```
cd /spark-jobserver/job-server-tests/target/scala-2.10/classes
```

####Result
```
curl localhost:8090/jobs/5453779a-f004-45fc-a11d-a39dae0f9bf4

```
