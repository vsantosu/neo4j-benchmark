# Setup

## Elastisearch

# System settings
# https://www.elastic.co/guide/en/elasticsearch/reference/master/setting-system-settings.html

# Maximum number of memory map areas a process may have
# https://serverfault.com/questions/681745/unable-to-change-vm-max-map-count-for-elasticsearch
# https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html

sysctl -w vm.max_map_count=65535
(echo 65535 > /proc/sys/vm/max_map_count)

# Number of files open

  trueno   soft    nofile      65536
  trueno   hard    nofile      65536


## Neo4j

# Number of files open
# https://github.com/neo4j/neo4j/issues/8087
# http://stackoverflow.com/questions/20924596/neo4j-warning-max-1024-open-files-allowed-minimum-of-40-000-recommended-see-t

/etc/security/limits.conf

  neo4j   soft    nofile      40000
  neo4j   hard    nofile      40000