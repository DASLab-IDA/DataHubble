# from numpy import corrcoef
from features import Features,Type
from view import View

class Chart(object):
    bar=0
    line=1
    scatter=2
    pie=3
    chart=['bar','line','scatter','pie']

def which_chart(tables,table_num):
    i=1
    while i< table_num:
        charts = []
        self=tables[i]  # type: Table
        T=map(list,zip(*self.D))
        if self.transformed:
            for column_id in range(self.column_num):
                f = Features(self.names[column_id],self.types[column_id],self.origins[column_id])
                #calculate min,max for numerical
                if f.type==Type.numerical:
                    if self.classify_num==1 or not self.describe2:#not categorized or categorized scatter
                        f.min,f.max=min(T[column_id]),max(T[column_id])
                        f.minmin=f.min
                        if f.min==f.max:
                            self.types[column_id]=f.type=Type.none
                            self.features.append(f)
                            continue
                    else:
                        delta=self.tuple_num/self.classify_num
                        f.min=[min(T[column_id][class_id*delta:(class_id+1)*delta]) for class_id in range(self.classify_num)]
                        f.minmin=min(f.min)
                        f.max=[max(T[column_id][class_id*delta:(class_id+1)*delta]) for class_id in range(self.classify_num)]
                        if sum([f.max[class_id]-f.min[class_id] for class_id in range(self.classify_num)])==0:
                            self.types[column_id]=f.type=Type.none
                            self.features.append(f)
                            continue
                        if min(f.min)==max(f.min) and min(f.max)==max(f.max):
                            if sum([0 if T[column_id][class_id*delta:(class_id+1)*delta]==T[column_id][(class_id+1)*delta:(class_id+2)*delta] else 1 for class_id in range(self.classify_num-1)])==0:
                                self.types[column_id]=f.type=Type.none
                                self.features.append(f)
                                continue
                #calculate distinct,ratio for categorical,temporal
                if f.type==Type.categorical or f.type==Type.temporal:
                    f.distinct=self.tuple_num
                    f.ratio=1.0

                self.features.append(f)
        else:
            print "error:table"+i+"not transformed"

        for j in range(self.column_num):
            for k in range(self.column_num):
                fj=self.features[j]
                fk=self.features[k]
                if fj.name[0:4]=='CNT(' and fj.name[-1]==')'and fk.ratio==1.0:
                    if fk.type==Type.numerical:
                        charts = []
                        charts.append(Chart.scatter)
                        charts.append(Chart.bar)
                        charts.append(Chart.pie)
                    if fk.type==Type.categorical:
                        charts = []
                        charts.append(Chart.bar)
                        charts.append(Chart.pie)
                    elif fk.type==Type.temporal:
                        charts = []
                        charts.append(Chart.bar)
                        charts.append(Chart.line)
                        # charts.append(Chart.pie)
                else:
                    charts = []
                for chart in charts:
                    v=View(self,k,j,-1,1,[T[k]],[T[j]],chart)
                    self.countviews.append(v)
                    self.countview_num+=1
                if charts:
                    while self.countview_num!=1:
                        if self.countviews[1]:
                            if  self.countviews[0].M<self.countviews[1].M:
                                del self.countviews[0]
                                self.countview_num-=1
                            else:
                                del self.countviews[1]
                                self.countview_num-=1
        i+=1
    return tables





