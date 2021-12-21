#!/usr/bin/env bash

# spark-sql
/usr/local/spark/bin/spark-sql --master spark://master:7077  --driver-memory 16g --executor-memory 16g --total-executor-cores 32 --conf spark.sql.warehouse.dir=hdfs://master:9000/hive/warehouse/bigbench

# spark-shell
/usr/local/spark/bin/spark-shell --master spark://master:7077  --driver-memory 16g --executor-memory 16g --total-executor-cores 32 --conf spark.sql.warehouse.dir=hdfs://master:9000/hive/warehouse/bigbench