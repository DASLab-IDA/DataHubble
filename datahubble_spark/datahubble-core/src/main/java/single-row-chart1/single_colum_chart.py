import sys
from table import Table
from chart import which_chart
import chart
from myGraph import myGraph


class Type(object):
    none=0
    categorical=1
    numerical=2
    temporal=3
    longStr=4

class Chart(object):
    bar=0
    line=1
    scatter=2
    pie=3
    cloud=4
    chart=['bar','line','scatter','pie','cloud']


def singleCol_to_chart(self):
    type_cloud=[]
    ctype=self.tables[0].types
    data=self.tables[0].D

    for i in range(self.column_num):
        if ctype[i]==Type.categorical:
            if len(data[0][i])>=120:
                self.tables[0].types[i]=Type.longStr
                name=self.tables[0].names[i]
                type_cloud.append('column:'+str(i+1)+'__'+name+'__'+'chart:cloud')

    self.addTables(self.tables[0].dealWithTable())
    which_chart(self.tables,self.table_num)
    begin_id=1
    cviews=[]
    while begin_id<self.table_num:
        self.tables[begin_id].dealWithTable()
        if self.tables[begin_id].countviews:
            cviews.append(self.tables[begin_id].countviews)
        begin_id+=1
    if self.view_num==0:
        print 'self.view_num==0'
        sys.exit(0)
    if type_cloud:
        cviews.append(type_cloud)
    return cviews




