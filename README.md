# DataHubble

#### 介绍

DataHubble是一种面向大数据交互式分析的智能交互向导系统，集成了列推荐、可视化推荐、方法推荐、用户兴趣分析等多个智能推荐模块接口，为大数据交互式分析提供智能交互向导。

#### 依赖环境

1.	Java 1.8 
2.	Mysql 5.7
3.	hadoop 2.9.2 
4.	spark 2.4.5 
5.	zookeeper 3.4.14
6.	Hive 3.1.2
7.	kylin 2.6.6
8. anaconda 2.5.0.0
9. python 2.7 
10.other dependencies in 配置说明文档.pdf

部署时可参考：配置说明文档.pdf

#### 主要文件

DataHubble主要包含文件：前端 html 文件夹 ，后端 smartinteract_spark文件夹，配置说明文档.pdf，DataHubble接口文档.md。核心代码位于smartinteract_spark/smartinteract-core

#### 使用说明 ：后端jar包部署 
1.       下载代码 git clone -b sql-result
https://e.coding.net/kaimary/Smart_interaction_Project.git


2.      在 smartinternect-core 下面修改全局变量 ip 地址为master或自己的ip地址，修改数据库名,修改表名 

注意anaconda 版本和本机版本的对应 
smartinteraction.py3env.path = /root/anaconda3/envs/py3.6/bin/python3

\Smart_interaction_Project\smartinteract_spark\smartinteract-core\src\main\java\com\daslab\smartinteract\kylin
KylinExecutor.java文件中 

    private Connection conn;
    private Driver driver;
    private String user = "ADMIN";
    private String pwd = "KYLIN";
    private String url = "jdbc:kylin://master:7070/Daslab";
    private JSONArray Schema;

jdbc:kylin:// master:7070/bigbench_10t
bigbench_10t是kylin里project名字 
修改为对应的 project 名 


3.    将 SparkExecutor.scala中
.config("spark.sql.warehouse.dir", "hdfs://master:9000/hive/warehouse/
改为对应路径的位置  如： 
.config("spark.sql.warehouse.dir", "hdfs://master:9000/hive/warehouse/bigbench_100g.db")


4.    将PCA_RandomForest.Py
args = ["path", "10.141.212.155", 10010, "", "", "bigbench_1t_sample", "websales_home_myshop_10000"]
修改为对应的 ip 数据集 数据库 
args = ["path", "10.141.212.155", 10010, "", "", "bigbench_100g", "websales_home_myshop"]
kylin_util = KylinUtil('master', '7070', 'ADMIN', 'KYLIN', 'bigbench_100g')


5.    将：HiveConfig.java
conn = DriverManager.getConnection("jdbc:hive2://" + MASTER + ":10010/bigbench_10t_sample;auth=none");
改为：
conn = DriverManager.getConnection("jdbc:hive2://" + MASTER + ":10010/bigbench_100g;auth=none");
对应的数据库名：例如bigbench_100g  

若仍有报错原代码可 修改为 
conn = DriverManager.getConnection("jdbc:hive2://localhost:10010/bigbench_100g;auth=none");


6.     mvn打jar包 mvn clean package 
打包 smartinteract-core 	
目标文件夹在
\smartinteract_spark\smartinteract-core\target

7.     anaconda 切换 环境为 py2.7  conda activate py2.7

8.     上传jar包  mv XXX.jar XXX-6.2 jar 

9.     输入运行命令：nohup /usr/local/spark/bin/spark-submit --master spark://localhost:7077 --class com.daslab.smartinteract.SpringBootApp --driver-memory 8g --executor-memory 8g --total-executor-cores 16 smartinteract-core-0.0.1-SNAPSHOT.jar  > /home/scidb/nohup.out &


10.     将 ipconfiguration.txt 放在root 下  其内容为主机地址

11.     jps 查看 sparksubmit 进程是否存在  后端部署，查看日志 vim /usr/local/apache-kylin-2.6.6-bin-hadoop3/logs/kylin.log 
确认报错。在mysql 中创建一个用户 insert into users(uid,category,password,username,created_at,updated_at) values('1','Home & Kitchen','123','user1','2020-09-28 09:22:19','2020-09-28 09:22:19');
在mysql 的 创建 rangetable表

#### 接口文档：

接口文档中详细介绍了本项目对外开放的六个接口，用户可参照其中的示例说明，轻量、方便地体验我们的项目功能。
详情请见DataHubble接口文档.md。

