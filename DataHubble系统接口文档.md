# 可视化推荐接口

### 请求URL

[http://10.176.24.40:8083/api/data/recommendViz](http://10.176.24.40:8083/api/data/recommendViz)

### 请求方式

POST

### 请求参数

|参数名|必选|类型|说明|
|:----|:----|:----|:----|
|databaseName|是|string|数据库名称|
|columnName|是|string|当前列名|
|range|是|array<string>|各列数据选取范围列表|

#### 请求参数示例

|参数名|参数值|
|:----|:----|
|databaseName|bigbench_10t_sample|
|columnName|销售量|
|range|{"tableName":"websales_home_myshop_10000","columnName":"solddate","type":93,"data":["2019-11-30","2019-12-31"]}{"tableName":"websales_home_myshop_10000","columnName":"itemname","type":12,"data":[]}{"tableName":"websales_home_myshop_10000","columnName":"price","type":8,"data":[769,5978]}{"tableName":"websales_home_myshop_10000","columnName":"discount","type":8,"data":[1,8]}{"tableName":"websales_home_myshop_10000","columnName":"category","type":12,"data":[]}{"tableName":"websales_home_myshop_10000","columnName":"customer","type":12,"data":[]}{"tableName":"websales_home_myshop_10000","columnName":"age","type":4,"data":[15,39]}{"tableName":"websales_home_myshop_10000","columnName":"gender","type":12,"data":[]}{"tableName":"websales_home_myshop_10000","columnName":"province","type":12,"data":[]}{"tableName":"websales_home_myshop_10000","columnName":"nationality","type":12,"data":[]}{"tableName":"websales_home_myshop_10000","columnName":"itemdesc","type":12,"data":[]}{"tableName":"websales_home_myshop_10000","columnName":"quantity","type":4,"data":[12,29]}|

### 返回参数

|参数名|类型|说明|
|:----|:----|:----|
|xcolumn|string|推荐的图表x轴的维度名称|
|ycolumn|string|推荐的图表y轴的维度名称|
|cType|string|推荐的图表类型|
|classify|list|    |
|xdata|list|推荐的图表x轴的数据|
|ydata|list|推荐的图表y轴的数据|

#### 返回参数示例

```plain
[
    {
        "xcolumn": "gender",
        "ycolumn": "SUM(quantity)",
        "cType": "pie",
        "classify": [],
        "xdata": [
            [
                "女",
                "未设置",
                "男"
            ]
        ],
        "ydata": [
            [
                1408,
                1612,
                1444
            ]
        ]
    },
    {
        "xcolumn": "solddate",
        "ycolumn": "SUM(quantity)",
        "cType": "bar",
        "classify": [],
        "xdata": [
            [
                "2019-11-30",
                "2019-12-01"
            ]
        ],
        "ydata": [
            [
                2052,
                2412
            ]
        ]
    },
    
    {
        "xcolumn": "gender",
        "ycolumn": "SUM(age)",
        "cType": "pie",
        "classify": [],
        "xdata": [
            [
                "女",
                "未设置",
                "男"
            ]
        ],
        "ydata": [
            [
                1868,
                2044,
                1994
            ]
        ]
    },
    {
        "xcolumn": "solddate",
        "ycolumn": "SUM(age)",
        "cType": "bar",
        "classify": [],
        "xdata": [
            [
                "2019-11-30",
                "2019-12-01"
            ]
        ],
        "ydata": [
            [
                2667,
                3239
            ]
        ]
    },
    {
        "xcolumn": "solddate",
        "ycolumn": "SUM(age)",
        "cType": "bar",
        "classify": [],
        "xdata": [
            [
                "Nov",
                "Dec"
            ]
        ],
        "ydata": [
            [
                2667,
                3239
            ]
        ]
    },
    {
        "xcolumn": "gender",
        "ycolumn": "SUM(discount)",
        "cType": "pie",
        "classify": [],
        "xdata": [
            [
                "女",
                "未设置",
                "男"
            ]
        ],
        "ydata": [
            [
                323.0,
                368.0,
                339.0
            ]
        ]
    }
]
```

# 导入数据接口

### 请求URL

[http://10.176.24.40:8083/api/data/dataLoading](http://10.176.24.40:8083/api/data/dataLoading)

### 请求方式

POST

### 请求参数

|参数名|必选|类型|说明|
|:----|:----|:----|:----|
|databaseName|是|string|数据库名称|
|tableName|是|string|表名|
|inpath|是|string|要导入的数据文件的绝对路径|
|columnNames|是|array[string]|数据表列名列表|
|columnTypes|是|array[string]|数据表列类型列表|

#### 请求参数示例

备注：databaseName和tableName不可与Hive中已有的数据库和表重复

|参数名|参数值|
|:----|:----|
|databaseName|bigbench_10t_sample|
|tableName|websales_home_myshop|
|inpath|/root/websales_home_myshop.txt|
|columnNames|"itemname", "price","price1", "quantity", "quantity1", "discount", "discount1", "category", "solddate", "customer", "age", "age1", "gender", "province", "nationality", "itemdesc"|
|columnTypes|"string", "double", "double","int", "int", "double", "double", "string", "timestamp", "string", "int", "int", "string", "string","string","string"|

### 返回参数

|参数名|类型|说明|
|:----|:----|:----|
|status|int|导入状态 1：成功；0：失败|

#### 返回参数示例

```plain
{
    "status": 1
}
```

# 查询日志接口

### 请求URL

[http://10.176.24.40:8083/api/data/getRecentOperation](http://10.176.24.40:8083/api/data/getRecentOperation)

### 请求方式

POST

### 请求参数

|参数名|必选|类型|说明|
|:----|:----|:----|:----|
|recent|是|int|查询日志数目|
|tablename|是|string|表名|

#### 请求参数示例

|参数名|参数值|
|:----|:----|
|tableName|websales_home_myshop_10000|
|recent|5|

### 返回参数

|参数名|类型|说明|
|:----|:----|:----|
|log_id|int|日志编号|
|usr_id|int|用户编号|
|tablename|string|表名|
|step|int|步骤数|
|record|list|日志操作记录|
|chartId|int|表编号|
|xcolumn|string|x轴名称|
|ycolumn|string|y轴名称|
|previous|int|前一步日志编号|
|time|date|操作时间|

#### 返回参数示例

```plain
// 返回构建结果的同时返回前端界面的链接供用户查看进度
[
    {
        "log_id": 36,
        "user_id": 1,
        "tablename": "websales_home_myshop_10000",
        "step": 2,
        "record": [
            {
                "chartId": 0
            },
            {
                "xcolumn": "solddate"
            },
            {
                "ycolumn": "SUM(quantity)"
            }
        ],
        "previous": 35,
        "time": "2021-05-25 10:15:06"
    },
    {
        "log_id": 35,
        "user_id": 1,
        "tablename": "websales_home_myshop_10000",
        "step": 1,
        "record": [
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "quantity",
                "type": 4,
                "data": [
                    12,
                    22
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "solddate",
                "type": 93,
                "data": [
                    "2019-11-30",
                    "2020-01-21"
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "itemname",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "price",
                "type": 8,
                "data": [
                    769,
                    5978
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "discount",
                "type": 8,
                "data": [
                    1,
                    8
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "category",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "customer",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "age",
                "type": 4,
                "data": [
                    15,
                    39
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "gender",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "province",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "nationality",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "itemdesc",
                "type": 12,
                "data": []
            }
        ],
        "previous": -1,
        "time": "2021-05-25 10:14:59"
    },
    {
        "log_id": 34,
        "user_id": 1,
        "tablename": "websales_home_myshop_10000",
        "step": 2,
        "record": [
            {
                "chartId": 1
            },
            {
                "xcolumn": "gender"
            },
            {
                "ycolumn": "SUM(quantity)"
            }
        ],
        "previous": 33,
        "time": "2021-05-25 09:34:31"
    },
    {
        "log_id": 33,
        "user_id": 1,
        "tablename": "websales_home_myshop_10000",
        "step": 1,
        "record": [
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "quantity",
                "type": 4,
                "data": [
                    12,
                    22
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "solddate",
                "type": 93,
                "data": [
                    "2020-08-06",
                    "2020-08-31"
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "itemname",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "price",
                "type": 8,
                "data": [
                    769,
                    5978
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "discount",
                "type": 8,
                "data": [
                    1,
                    8
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "category",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "customer",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "age",
                "type": 4,
                "data": [
                    15,
                    39
                ]
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "gender",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "province",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "nationality",
                "type": 12,
                "data": []
            },
            {
                "tablename": "websales_home_myshop_10000",
                "columnname": "itemdesc",
                "type": 12,
                "data": []
            }
        ],
        "previous": -1,
        "time": "2021-05-25 09:34:04"
    },
    {
        "log_id": 32,
        "user_id": 1,
        "tablename": "websales_home_myshop_10000",
        "step": 2,
        "record": [
            {
                "chartId": 2
            },
            {
                "xcolumn": "gender"
            },
            {
                "ycolumn": "SUM(quantity)"
            }
        ],
        "previous": 31,
        "time": "2021-05-25 09:12:23"
    }
]
```

# 保存日志接口

### 请求URL

[http://10.176.24.40:8083/api/data/saveOperation](http://10.176.24.40:8083/api/data/saveOperation)

### 请求方式

POST

### 请求参数

|参数名|必选|类型|说明|
|:----|:----|:----|:----|
|userId|是|int|用户编号|
|tablename|是|string|表名|
|step|是|int|步骤数|
|record|是|list|日志操作记录|
|chartId|是|int|表编号|
|xcolumn|是|string|x轴名称|
|ycolumn|是|string|y轴名称|
|previous|是|int|前一步日志编号|

#### 请求参数示例

|参数名|参数值|
|:----|:----|
|tableName|websales_home_myshop_10000|
|userId|1|
|step|2|
|chartId|0|
|xcolumn|solddate|
|ycolumn|SUM(quantity)|
|previous|37|

### 返回参数

|参数名|类型|说明|
|:----|:----|:----|
|log_id|int|日志编号|

#### 返回参数示例

```plain
38
```

# 方法推荐接口

### 请求URL

[http://10.176.24.40:8083/api/data/recommendAnalysisMethod](http://10.176.24.40:8083/api/data/recommendAnalysisMethod)

### 请求方式

POST

### 请求参数

|参数名|必选|类型|说明|
|:----|:----|:----|:----|
|xcolumn|是|string|x轴名称|
|ycolumn|是|string|y轴名称|
|previousStepId|是|int|前一步日志编号|
|dbName|否|string|数据库名称|

#### 请求参数示例

|参数名|参数值|
|:----|:----|
|xcolumn|solddate|
|ycolumn|SUM(quantity)|
|previousStepId|37|
|dbName|bigbench_10t_sample|

### 返回参数

|参数名|类型|说明|
|:----|:----|:----|
|model|string|推荐模型名称|
|task|list|推荐任务名称|

#### 返回参数示例

```plain
[
    {
        "model": "xgboost",
        "task": [
            "预测",
            "预测商品[销量]",
            "预测客户购买情况",
            "设计促销活动保证销量"
        ]
    },
    {
        "model": "lsa",
        "task": [
            "诊断",
            "诊断店铺经营状况",
            "发现店铺隐藏问题",
            "[quantity]异常值分析"
        ]
    }
]
```

# 列推荐接口

### 接口说明

根据数据库名、表名、列名获取推荐列及推荐范围

### 请求URL

[http://10.176.24.40:8083/api/data/recommendColumn](http://10.176.24.40:8083/api/data/recommendColumn)

### 请求方式

POST

### 请求参数

|参数名|必选|类型|说明|
|:----|:----|:----|:----|
|databaseName|是|string|数据库名|
|tableName|是|string|表名|
|columnName|是|string|列名|

#### 请求参数示例

|参数名|参数值|
|:----|:----|
|databaseName|bigbench_100g|
|tableName|websales_home_myshop_10000|
|columnName|price|

### 返回参数

|参数名|类型|说明|
|:----|:----|:----|
|columnname|string|列名|
|range|list|推荐列的范围|

#### 返回参数示例

```plain
{
    "column_recommend": [
        {
            "columnname": "quantity",
            "range": [
                32.0,
                42.0
            ]
        },
        {
            "columnname": "solddate",
            "range": [
                "2021-11-30",
                "2021-12-31"
            ]
        }
    ]
}
```

# range接口

### 接口说明

根据数据库名、表名、列名获取推荐列、推荐范围、具体数据

### 请求URL

[http://10.176.24.40:8083/api/data/recommendColumnRange](http://10.176.24.40:8083/api/data/recommendColumnRange)

### 请求方式

POST

### 请求参数

|参数名|必选|类型|说明|
|:----|:----|:----|:----|
|databaseName|是|string|数据库名|
|tableName|是|string|表名|
|columnName|是|string|列名|

#### 请求参数示例

|参数名|参数值|
|:----|:----|
|databaseName|bigbench_100g|
|tableName|websales_home_myshop_10000|
|columnName|price|

### 返回参数

|参数名|类型|说明|
|:----|:----|:----|
|columnname|string|列名|
|tablename|string|表名|
|type|int|字段类型|
|range|list|推荐列的范围|
|data|list|推荐列的具体数据|

#### 返回参数示例

```plain
{
    "recommend": [
        {
            "columnname": "quantity",
            "tablename": "websales_home_myshop_10000",
            "type": 4,
            "range": [
                1,
                99
            ],
            "data": [
                12,
                22
            ]
        },
        {
            "columnname": "solddate",
            "tablename": "websales_home_myshop_10000",
            "type": 93,
            "range": [
                "2017-01-01",
                "2021-12-31"
            ],
            "data": [
                "2019-11-30 00:00:00.0",
                "2019-12-31 00:00:00.0"
            ]
        }
}



```



 

