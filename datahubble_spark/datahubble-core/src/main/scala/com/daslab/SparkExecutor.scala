package com.daslab

import java.sql.Date
import java.text.SimpleDateFormat
import java.util

import net.sf.json.{JSONArray, JSONObject}
import org.apache.spark.sql.functions._
import org.apache.spark.sql.{Row, SparkSession}

class SparkExecutor() {
  val spark: SparkSession = SparkSession
      .builder.master("spark://master:7077")
      .appName(s"SmartInteractDriver")
      .enableHiveSupport()
      .config("spark.sql.warehouse.dir", "hdfs://master:9000/hive/warehouse/bigbench/bigbench_1t_sample.db")
      .getOrCreate()

  def executeSQL1(sql: String) : JSONArray = {
    val start = System.currentTimeMillis()
    var jSONArray = new JSONArray()
    val sqlDF = spark.sqlContext.sql(sql)
    val columntypes = sqlDF.dtypes.toList
    //  获取列名
    var jObfect = new JSONObject()
    columntypes.foreach {
      col => {
        col._2 match {
          case "DateType" =>
            val tmp = "TimestampType"
            jObfect.put(col._1, tmp)
          case _ =>
            jObfect.put(col._1, col._2)
        }
      }
    }
    jSONArray.add(jObfect)
    //  获取每一行值
    sqlDF.collect().foreach {
      row => {
        var jObject = new JSONObject()
        row.toSeq.foreach {
          var sum = 0
          col => {
            sum = sum + 1
            // solddate在hive中为date类型, 在代码中转换为sql.Timestamp类型
            col match {
              case date: java.sql.Date =>
                val tmp = new java.sql.Timestamp(date.getTime)
                jObject.put(sum.toString, tmp)
              case _ =>
                jObject.put(sum.toString, col)
            }
          }
        }
        jSONArray.add(jObject)
      }
    }
    jSONArray
  }

  def executeSQL(sql: String) : JSONArray = {
    val sqlDF = spark.sqlContext.sql(sql)
    val jsonArray = new JSONArray

    sqlDF.collect().foreach{
      row => {
        val jsonObject = new JSONObject()
        row.toSeq.foreach{
          var sum = 0
          col => {
            sum = sum + 1
            jsonObject.put(sum.toString, col)
          }
        }
        jsonArray.add(jsonObject)
      }
    }

    jsonArray
  }

//spark-getSqlResult
  def getSqlResult(sql: String) : JSONObject = {
    val result = new JSONObject()
    val start = System.currentTimeMillis()
    val sqlDF = spark.sqlContext.sql(sql)
    val end = System.currentTimeMillis()
    result.put("time", (start-end).toString)
    println("SparkExecutor getSqlResult =========== time cost" + (start-end).toString)

    val tableData = new JSONArray

    val columntypes = sqlDF.dtypes.toList
    //增加列名
    val colNames = new JSONArray
    columntypes.foreach{
      col => {
        colNames.add(col._1)
      }
    }
    tableData.add(colNames)

    //增加值
    sqlDF.collect().foreach{
      row => {
        val jsonObject = new JSONArray
        row.toSeq.foreach{
          col => {
            jsonObject.add(col)
          }
        }
        tableData.add(jsonObject)
      }
    }
    result.put("tableData", tableData.toString)
    println("SparkExecutor getSqlResult =========== " + tableData.toString)

    result
  }

  def executeSQLForTypes(sql: String) : util.ArrayList[String] = {
    val sqlDF = spark.sqlContext.sql(sql)
    var columnTypes = sqlDF.dtypes.toList
    val typeArray = new util.ArrayList[String]()
    columnTypes = columnTypes.filter(!_._1.startsWith("verdictdb")) // drop verdictdb抽样生成的无关列
    columnTypes.foreach{
      col => {
        col._2 match {
          case "DateType" =>
            typeArray.add("TimestampType")
          case _ =>
            typeArray.add(col._2)
        }
      }
    }
    typeArray
  }

  def executeSQLForRanges(sql: String) : util.LinkedHashMap[String, util.LinkedHashSet[String]] = {
    val sqlDF = spark.sqlContext.sql(sql)
    val start = System.currentTimeMillis()
    var columnTypes = sqlDF.dtypes.toList
    val ranges = new util.LinkedHashMap[String, util.LinkedHashSet[String]]()

    columnTypes = columnTypes.filter(!_._1.startsWith("verdictdb")) // drop verdictdb抽样生成的无关列
    columnTypes.foreach{
      col => {
        val range = new util.LinkedHashSet[String]()
        var rows = new Array[Row](0)
        col._2 match {
          case "IntegerType" | "DoubleType" | "LongType" | "DecimalType" | "RealType" | "TimestampType" | "DateType" =>
            rows = sqlDF.select(col._1).agg(col._1 -> "min", col._1 -> "max").collect()
          case  "StringType" =>
            rows = sqlDF.select(col._1).distinct().collect()
          case _ =>
            println("SparkExecutor executeSQLForRanges =========== not support this type " + col._2)
        }
        rows.foreach{
          row => {
            row.toSeq.foreach{
              col => {
                range.add(col.toString)
              }
            }
          }
        }
        println("SparkExecutor executeSQLForRanges =========== " + col._1 + " range: " + range)
        ranges.put(col._1, range)
      }
    }
    println("SparkExecutor executeSQLForRanges =========== time cost: " + (System.currentTimeMillis()-start)/1000 + "s")
    ranges
  }

  def executeSQLForDistributions(sql: String) : util.LinkedHashMap[String, util.TreeMap[String, Integer]] = {
    val sqlDF = spark.sqlContext.sql(sql)
    val start = System.currentTimeMillis()
    var columnTypes = sqlDF.dtypes.toList
    val distributions = new util.LinkedHashMap[String, util.TreeMap[String, Integer]]

    columnTypes = columnTypes.filter(!_._1.startsWith("verdictdb")) // drop verdictdb抽样生成的无关列
    columnTypes.foreach{
      col => {
        val distribution = new util.TreeMap[String, Integer]
        var rows = new Array[Row](0)
        col._2 match {
          case "StringType" =>
            rows = sqlDF.select(col._1).groupBy(col._1).agg(col._1 -> "count").orderBy(desc("count("+col._1+")")).collect()
          case _ =>
            rows = sqlDF.select(col._1).groupBy(col._1).agg(col._1 -> "count").orderBy(col._1).collect()
        }
        rows.foreach{
          row => {
            distribution.put(row.get(0).toString, row.getLong(1).toInt)
          }
        }
        println("SparkExecutor executeSQLForDistributions =========== " + col._1 + " distribution: " + distribution)
        distributions.put(col._1, distribution)
      }
    }
    println("SparkExecutor executeSQLForDistributions =========== time cost: " + (System.currentTimeMillis()-start)/1000 + "s")
    distributions
  }

  def getSparkSession: SparkSession = spark

}
