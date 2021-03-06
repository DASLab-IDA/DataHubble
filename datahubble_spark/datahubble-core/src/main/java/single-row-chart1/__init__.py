# -*- coding: UTF-8 -*-
import MySQLdb
import numpy as np
import pandas as pd
from instance import Instance
from table import Table
from chart import Chart
from myGraph import myGraph
from features import Type
import codecs
from encodings import utf_8
from impala.dbapi import connect
import view
import keyColumn_RandomForest
import cw_filter
import datetime
import sys
import _uniout
import thread
import timer
import env
import logging
import time
from datetime import datetime

codecs.register(lambda encoding: utf_8.getregentry())
reload(sys)
sys.setdefaultencoding('utf8')
sys.setrecursionlimit(1000000)
# connet to mysqldb
# # args=["path","localhost", 3306, "root" ,"root" ,"deepeye" ,"electricity","city", "date", "elctConsumption", "varchar(25)", "date" ,"float"]
# args=["path","localhost", 3306, "root" ,"root" ,"deepeye" ,"electricity"]
# dbArgs = args[1:6]
# assign_columns=[]
# column_num=(len(args)-7)/2
# if column_num:
#     assign_columns=args[7:-1]
# instance=Instance(args[6])
# instance.addTable(Table(instance,False,'',''))
#
# conn=MySQLdb.connect(host=dbArgs[0],port=int(dbArgs[1]),user=dbArgs[2],passwd=dbArgs[3],db=dbArgs[4],charset='utf8')
# cur = conn.cursor()
# if column_num:
#     instance.column_num=instance.tables[0].column_num=column_num
#     instance.tables[0].origins=[i for i in range(instance.tables[0].column_num)]
#     instance.tuple_num=instance.tables[0].tuple_num=cur.execute("SELECT * FROM "+args[6])
#     instance.tables[0].D=map(list,cur.fetchall())
#     for i in range(0,instance.column_num):
#         instance.tables[0].names.append(args[8+i])
#         instance.tables[0].types.append(Type.getType(args[8+i+instance.column_num].lower()))
# else:
#     cur.execute("SHOW FULL COLUMNS FROM "+args[6])
#     col_messge=cur.fetchall()
#     for i in col_messge:
#         assign_columns.append(i[0])
#         column_num+=1
#     for i in col_messge:
#         assign_columns.append(i[1])
#     instance.column_num=instance.tables[0].column_num=column_num
#     instance.tables[0].origins=[i for i in range(instance.tables[0].column_num)]
#     instance.tuple_num=instance.tables[0].tuple_num=cur.execute("SELECT * FROM "+args[6])
#     instance.tables[0].D=map(list,cur.fetchall())
#     for j in range(0,column_num):
#         instance.tables[0].names.append(assign_columns[j])
#         instance.tables[0].types.append(Type.getType(assign_columns[column_num+j].lower()))

# connect to hivedb
tn = sys.argv     #scan input

if len(tn) >= 3:
    databaseName = tn[1]
    tableName = tn[2]
    if len(tn) == 4:
        focus_col = tn[3]
        if focus_col:
            print "0) " + focus_col + "                          1"
else:
    sys.exit('System need three arguments:"Databases","tableName","focusColumn". Args error! ')

# read recommend from mysql
args = [
    "path", env.host, env.mysqlPort,"root",
    "root", "userdb", "column_recommend"]
dbArgs = args[1:6]    #[env.host, env.mysqlPort,"root","root", "userdb", "column_recommend"]
# connect to mysql
conn = MySQLdb.connect(host=dbArgs[0], port=int(dbArgs[1]), user=dbArgs[2],
                       passwd=dbArgs[3], db=dbArgs[4], charset='utf8')
cur = conn.cursor()

#?????????mysql??????????????????
cur.execute("SELECT table_name,recommend_col,recommend_range FROM " + args[6])
recTable = cur.fetchall()
compute = True
for row in recTable:
    if tableName in row[0]:
        reccols = str(row[1]).split("&")
        print reccols[1]
        print row[2]
        compute = False

# ?????????mysql??????????????????
# cur.execute("SELECT table_name,recommend_col,recommend_range FROM " + args[6])
# tableList = map(list, cur.fetchall())
# tableList = [str(x) for x in tableList]
# compute = True
# for i in tableList:
#     if tableName in i:
#         cur.execute("SELECT recommend_col,recommend_range FROM " + args[6])
#         data = cur.fetchall()
#         numList = []
#         reccol = str(data[0][0]).split("&")
#         foucusInRec = -1
#
#         for i in range(0, 2):
#             if focus_col in reccol[i]:
#                 foucusInRec = i
#         if foucusInRec == 0:
#             print reccol[1]
#         else:
#             print reccol[1]
#         # for i in range(len(reccol)):
#         #     if (reccol[i] == ")"):
#         #         numList.append(i)
#         # for i in range(len(numList) - 1):
#         #     if focus_col not in reccol[numList[i] - 1:numList[i + 1] - 1]:
#         #         print reccol[numList[i] - 1:numList[i + 1] - 1]
#         # print reccol[numList[-1] - 1:-1]
#         print data[0][1]
#         compute = False
#         break

# print "if compute? "+compute
if (compute):
    args = ["path", env.host, env.hivePort, "", "", databaseName, tableName]
    dbArgs = args[1:7]
    instance = Instance(args[6])
    instance.addTable(Table(instance, False, '', ''))
    conn = connect(host=dbArgs[0], port=dbArgs[1], database=dbArgs[4], auth_mechanism='PLAIN')
    # print "connect hive success"
    assign_columns = []
    cur = conn.cursor()
    cur.execute("SELECT * FROM " + args[6] + " LIMIT 1")
    des = cur.description
    para = ""
    for i in des:
        colnames = i[0].split(".")
        if ('1' in colnames[1]):
            continue
        else:
            assign_columns.append(colnames[1])
    for i in assign_columns:
        para += i + ","
    para = para[0:-1]
    cur.execute("SELECT " + para + " FROM " + args[6])

    # timer.timerStart()
    # instance.tables[0].D = pd.DataFrame(map(list, cur.fetchall())).dropna(axis=0).values.tolist()
    # print "get data from hive. plz wait"

    instance.tables[0].D = map(list, cur.fetchall())
    # ??????1t??????soldtime??????hive???????????????date?????????python???string??????????????????hive???timestamp?????????python???datetime???
    for i in instance.tables[0].D:
        # i[5] = time.mktime(i[5].timetuple())
        i[5] = datetime.strptime(i[5], '%Y-%m-%d')
    exa = np.array(instance.tables[0].D)
    # timer.timerEnd()
    # print instance.tables[0].D.isnull().sum()
    tuple_num = 0
    # print "start dealing data"
    for i in instance.tables[0].D:
        tuple_num += 1
    instance.tuple_num = instance.tables[0].tuple_num = tuple_num
    des = cur.description
    # ??????1t??????soldtime??????hive???????????????date?????????python???string??????????????????hive???timestamp?????????python???datetime???
    des[5] = ('solddate', 'TIMESTAMP', None, None, None, None, None)
    column_num = 0
    assign_columns = []
    for i in des:
        colnames = i[0].split(".")
        assign_columns.append(colnames[0])
        column_num += 1
    for i in des:
        assign_columns.append(i[1])
    instance.column_num = instance.tables[0].column_num = column_num
    instance.tables[0].origins = [i for i in range(instance.tables[0].column_num)]
    for j in range(0, column_num):
        instance.tables[0].names.append(assign_columns[j])
        instance.tables[0].types.append(Type.getType(assign_columns[column_num + j].lower()))
    cur.close()
    conn.close()
    # print "db connect close"
    # timer.timerStart()
    # calculate importance to recommend columns
    # print "start compute"
    feat_labels, importance, colsImpots = keyColumn_RandomForest.keyColumn_RandomForest(instance.tables[0].D, des)
    # timer.timerEnd()
    # timer.timerStart()
    # single column to chart type
    cws = instance.singleCol_to_chart()
    # w = instance.getweights()
    # for cw in cws:
    #     if type(cw[0]) == view.View:
    #         cw[0].output(1)
    #     else:
    #         print cw[0]

    cw_filter = cw_filter.cw_filter(feat_labels, importance, cws)
    rangeRes = _uniout.unescape(str(cw_filter), 'utf8').replace("u'", "'")

    print rangeRes
    # timer.timerEnd()

    # TODO save recommend to mysql
    args = ["path", env.host, env.mysqlPort, "root", "root", "userdb", "column_recommend"]
    dbArgs = args[1:6]
    conn = MySQLdb.connect(host=dbArgs[0], port=int(dbArgs[1]), user=dbArgs[2], passwd=dbArgs[3], db=dbArgs[4],
                           charset='utf8')

    cur = conn.cursor()
    sql = '''INSERT INTO userdb.column_recommend (table_name, recommend_col,recommend_range)VALUES ("%s","%s","%s")''' % (
        tableName, MySQLdb.escape_string(colsImpots), MySQLdb.escape_string(rangeRes))
    # sql='INSERT INTO userdb.column_recommend (`table_name`, `recommend_col`,`recommend_range`) VALUES ('\
    #     +"'"+tableName+"'"+","+"'"+colsImpots+"'"+","\
    #     +"'"+str(cw_filter)+"'"\
    #     +")"
    try:
        cur.execute(sql)
        conn.commit()
    except Exception, e:
        print e
        print sql
    cur.close()
    conn.close()
