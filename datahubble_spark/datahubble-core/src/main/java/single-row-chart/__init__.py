# -*- coding: UTF-8 -*-
import MySQLdb
from instance import Instance
from table import Table
from features import Type
import codecs
from encodings import utf_8
from impala.dbapi import connect
import keyColumn_RandomForest
import cw_filter
import sys
import env
from datetime import datetime

codecs.register(lambda encoding: utf_8.getregentry())
reload(sys)
sys.setdefaultencoding('utf8')
sys.setrecursionlimit(1000000)

# scan input
args = sys.argv
if len(args) == 4:
    databaseName = args[1]
    tableName = args[2]
    colName = args[3]
else:
    sys.exit('Need three arguments:"Databases","tableName". Args error! ')

# read from mysql
dbArgs = [env.mysqlHost, env.mysqlPort, "root", "root", "userdb", "column_recommend"]
conn = MySQLdb.connect(host=dbArgs[0], port=int(dbArgs[1]), user=dbArgs[2],
                       passwd=dbArgs[3], db=dbArgs[4], charset='utf8')
cur = conn.cursor()
cur.execute("SELECT table_name, recommend_col, recommend_range FROM " + dbArgs[5])
recTable = cur.fetchall()
compute = True
for row in recTable:
    if tableName == row[0]:
        reccols = str(row[1]).split("&")
        print reccols[1]
        print row[2]
        compute = False

# compute from hive
if (compute):
    # connect to hive
    dbArgs = [env.hiveHost, env.hivePort, databaseName, tableName]
    conn = connect(host=dbArgs[0], port=dbArgs[1], database=dbArgs[2], auth_mechanism='PLAIN')
    cur = conn.cursor()
    # get schema
    cur.execute("SELECT * FROM " + dbArgs[3] + " LIMIT 1")
    # schema info
    des = cur.description
    column_names = []
    column_types = []
    for i in des:
        colnames = i[0].split(".")
        if ('1' in colnames[1]):
            continue
        else:
            column_names.append(colnames[1])
            column_types.append(i[1])

    para = ""
    for i in column_names:
        para += i + ","
    para = para[0:-1]
    # get data
    cur.execute("SELECT " + para + " FROM " + dbArgs[3])
    instance = Instance(dbArgs[3])
    instance.addTable(Table(instance, False, '', ''))
    instance.tables[0].D = map(list, cur.fetchall())
    # 新的1t数据soldtime列的hive数据类型为date（对应python的string），需要转为hive的timestamp（对应python的datetime）
    for i in range(len(column_types)):
        if column_types[i] == 'DATE':
            for j in instance.tables[0].D:
                j[i] = datetime.strptime(j[i], '%Y-%m-%d')
    instance.tuple_num = instance.tables[0].tuple_num = len(instance.tables[0].D);
    instance.column_num = instance.tables[0].column_num = len(column_names)
    instance.tables[0].origins = [i for i in range(instance.tables[0].column_num)]
    for j in range(instance.column_num):
        instance.tables[0].names.append(column_names[j])
        instance.tables[0].types.append(Type.getType(column_types[j].lower()))

    des = cur.description
    feat_labels, importance, colsImpots = keyColumn_RandomForest.keyColumn_RandomForest(instance.tables[0].D, des, colName)

    cws = instance.singleCol_to_chart()

    cw_filter = cw_filter.cw_filter(feat_labels, importance, cws)
    rangeRes = str(cw_filter)
    # rangeRes = _uniout.unescape(str(cw_filter), 'utf8').replace("u'", "'")
    print rangeRes

    cur.close()
    conn.close()

    # save column_recommend to mysql
    dbArgs = [env.mysqlHost, env.mysqlPort, "root", "root", "userdb", "column_recommend"]
    conn = MySQLdb.connect(host=dbArgs[0], port=int(dbArgs[1]), user=dbArgs[2], passwd=dbArgs[3], db=dbArgs[4],
                           charset='utf8')

    cur = conn.cursor()
    sql = '''INSERT INTO userdb.column_recommend (table_name, recommend_col,recommend_range)VALUES ("%s","%s","%s")''' % (
        tableName, MySQLdb.escape_string(colsImpots), MySQLdb.escape_string(rangeRes))
    try:
        cur.execute(sql)
        conn.commit()
    except Exception, e:
        print e
    cur.close()
    conn.close()

    # 存在一个问题，mysql中未存储databasename
