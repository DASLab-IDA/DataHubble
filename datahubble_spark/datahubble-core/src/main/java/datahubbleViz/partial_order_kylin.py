# coding:utf-8
import sys
reload(sys)
from instance import Instance
from table import Table
from view import Chart
from features import Type
from kylin_util import kylin_util

# read data from database
argv = sys.argv
instance = Instance(argv[0])
instance.addTable(Table(instance, False, '', ''))
instance.column_num = instance.tables[0].column_num = argv[1]
for i in range(0, instance.column_num):
    instance.tables[0].names.append(argv[2 + i])
    instance.tables[0].types.append(Type.getType(argv[2 + i + instance.column_num].lower()))
instance.tables[0].origins = [i for i in range(instance.tables[0].column_num)]
instance.tuple_num = instance.tables[0].tuple_num = kylin_util.executeQuery('select count(*) from {}'.format(instance.tale_name))[0][0]

# get all views and their score
instance.addTables(instance.tables[0].dealWithTable())
begin_id = 1
while begin_id < instance.table_num:
    instance.tables[begin_id].dealWithTable()
    begin_id += 1

if instance.view_num == 0:
    print '{}'
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