# coding:utf-8
import sys
# sys.path.append('D:/0/python27/Lib/site-packages')
# reload(sys)

# sys.setdefaultencoding('utf-8')
import codecs
from encodings import utf_8
from impala.dbapi import connect
codecs.register(lambda encoding: utf_8.getregentry())

from instance import Instance
from table import Table
from view import Chart
from features import Type
import datetime
# 传入参数[表名，列名1、2、3，列类型1，2，3]
# read data from database
columnname = [
    'price',
    'itemname',
    'itemdesc',
    'category',
    'solddate',
    'quantity'
]
columntype = [
    2,1,1,1,3,2
]
# sql = 'SELECT * FROM web_sales_home1'
sql = sys.argv[2]
# print dbArgs
# instance=Instance(sys.argv[0])      # 表名
instance = Instance('web_sales_home1')  # 表名
instance.addTable(Table(instance, False, '', ''))
conn = connect(host='10.141.223.30', port=10010, database='bigbench', auth_mechanism='PLAIN')

cur = conn.cursor()
instance.column_num = instance.tables[0].column_num = 6
for i in range(0, instance.column_num):
    instance.tables[0].names.append(columnname[i])
    instance.tables[0].types.append(columntype[i])
instance.tables[0].origins = [i for i in range(instance.tables[0].column_num)]
cur.execute(sql)
rowcount = 0
for i in cur.fetchall():
    rowcount+=1
    instance.tables[0].D.append(i)
instance.tuple_num = instance.tables[0].tuple_num = rowcount
# print instance.tables[0].tuple_num
# instance.tables[0].D = map(list, cur.fetchall())
cur.close()
conn.close()

# if table == none ===> exit
if len(instance.tables[0].D) == 0:
    sys.exit(0)

# get all views and their score
instance.addTables(instance.tables[0].dealWithTable())
begin_id = 1
while begin_id < instance.table_num:
    instance.tables[begin_id].dealWithTable()
    begin_id += 1
if instance.view_num == 0:
    sys.exit(0)
instance.getM()
instance.getW()
instance.getScore()

order1 = order2 = 1
old_view = ''
for i in range(instance.view_num):
    view = instance.tables[instance.views[i].table_pos].views[instance.views[i].view_pos]
    classify = str([])
    if view.series_num > 1:
        classify = str([v[0] for v in view.table.classes]).replace("u'", '\'').decode("unicode-escape").replace("'",
                                                                                                                '"')
    x_data = str(view.X)
    # print x_data
    if view.fx.type == Type.numerical:
        x_data = str(view.X).replace("'", '"').replace('L', '')
    elif view.fx.type == Type.categorical:
        x_data = str(view.X).replace("u'", '\'').decode("unicode-escape").replace("'", '"')
    else:
        len_x = len(view.X)
        x_data = '[' + reduce(lambda s1, s2: s1 + s2, [str(map(str, view.X[i])) for i in range(len_x)]).replace("'",
                                                                                                                '"') + ']'
    y_data = str(view.Y)
    if view.fy.type == Type.numerical:
        y_data = y_data.replace('L', '')
    if old_view:
        order1 += 1
        order2 = 1
    data = '{"order1":' + str(
        order1) + ',"describe":"' + view.table.describe + '","x_name":"' + view.fx.name + '","y_name":"' + view.fy.name + '","chart":"' + \
           Chart.chart[view.chart] + '","classify":' + classify + ',"x_data":' + x_data + ',"y_data":' + y_data + '}'
    if Chart.chart[view.chart] != 'scatter'and Chart.chart[view.chart] != 'line':
        print(data)
    old_view = view
