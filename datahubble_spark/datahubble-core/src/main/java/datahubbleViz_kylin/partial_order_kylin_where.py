# coding:utf-8
import sys
reload(sys)
from instance import Instance
from table_where import Table
from view import Chart
from features import Type
from kylin_util import kylin_util

# read data from database

argv = sys.argv[1:]
instance = Instance(argv[0])
selected_column = argv[-2]
instance.filter = argv[-1]
instance.addTable(Table(instance, False, '', ''))
instance.column_num = instance.tables[0].column_num = int(argv[1])
for i in range(0, instance.column_num):
    instance.tables[0].names.append(argv[2 + i])
    instance.tables[0].types.append(Type.getType(argv[2 + i + instance.column_num].lower()))
instance.tables[0].origins = [i for i in range(instance.tables[0].column_num)]
sql = 'select count(*) from {}'.format(instance.tale_name) + ' where 1=1 ' + instance.filter
result = kylin_util.executeQuery(sql)
instance.tuple_num = instance.tables[0].tuple_num = result[0][0]

if(instance.tuple_num == 0):
    print []
    exit(0)

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

views = []
for i in range(instance.view_num):
    view = instance.tables[instance.views[i].table_pos].views[instance.views[i].view_pos]
    views.append(view)


def column_boost(vs, selected_col):
    def contains_col(v):
        def func(col):
            columns = instance.tables[0].names
            colx = columns[v.fx.origin]
            coly = columns[v.fy.origin]
            colz = columns[v.z_id] if v.z_id != -1 else None
            cols = {colx, coly, colz}
            return col in cols
        return func(selected_column)

    new_views = []
    if selected_col:
        views_with_col = list(filter(lambda x: contains_col(x), vs))
        views_without_col = list(filter(lambda x: not contains_col(x), vs))
        if views_with_col:
            new_views = views_with_col
            new_views.extend(views_without_col)
        else:
            new_views = vs
    return new_views


views = column_boost(views, selected_column)

for view in views:
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
    old_view = view
    print data
