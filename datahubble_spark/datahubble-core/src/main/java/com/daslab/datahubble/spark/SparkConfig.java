package com.daslab.datahubble.spark;

import org.apache.spark.SparkConf;
import org.apache.spark.sql.SparkSession;

public class SparkConfig {

    public static SparkSession getSession() {
        SparkConf conf = new SparkConf();
        conf.setJars(new String[]{ "/usr/local/smartinteraction/smartinteract-0.0.1-SNAPSHOT.jar"});
        SparkSession spark = SparkSession
                .builder()
                .appName("interfacing spark sql to hive metastore without configuration file")
                .master("spark://master:7077")
                .config("hive.metastore.uris", "thrift://master:9083")
                .enableHiveSupport()
                .getOrCreate();
        spark.sql("use bigbench1");
        return spark;
    }
}