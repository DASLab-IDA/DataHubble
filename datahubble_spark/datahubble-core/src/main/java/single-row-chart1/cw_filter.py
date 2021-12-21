import view
from features import Type
from chart import Chart
import datetime
def cw_filter(feat_labels, importance,cws):
    cw_filter = []
    #top2 important to filter
    for i in range(2):
        imp_oder = importance[i]
        for cw in cws:
            if type(cw[0]) == view.View:
                if feat_labels[imp_oder] in cw[0].x_name:
                    if cw[0].chart == Chart.pie:
                        continue
                    elif cw[0].chart == Chart.bar or cw[0].chart == Chart.line:
                        if cw[0].fx.type == Type.temporal:
                            if tem_filter(cw):
                                cw_filter.append(tem_filter(cw))
                        elif cw[0].fx.type == Type.categorical:
                            if cat_filter(cw):
                                cw_filter.append(cat_filter(cw))
            else:
                if feat_labels[imp_oder] in cw:
                    print 'longstr_cloud'
                    continue
    return cw_filter

def tem_filter(cw):
    recent_time=cw[0].X[0][-1]
    month_ago=recent_time-datetime.timedelta(days=30)
    week_ago=recent_time-datetime.timedelta(days=7)
    three_days_ago=recent_time-datetime.timedelta(days=3)
    if cw[0].X[0][0]<=month_ago:
        for i in range(1,len(cw[0].X[0])):
            if cw[0].X[0][-i]>=month_ago:
                continue
            else:
                X_new=list(cw[0].X[0][-i:])
                start=str(X_new[0].year)+"-"+str(X_new[0].month)+"-"+str(X_new[0].day)
                end=str(X_new[-1].year)+"-"+str(X_new[-1].month)+"-"+str(X_new[-1].day)
                return [cw[0].x_name,[start,end]]
    elif cw[0].X[0][0]<=week_ago:
        for i in range(1,len(cw[0].X[0])):
            if cw[0].X[0][-i]>=week_ago:
                continue
            else:
                X_new=list(cw[0].X[0][-i:])
                start=str(X_new[0].year)+"-"+str(X_new[0].month)+"-"+str(X_new[0].day)
                end=str(X_new[-1].year)+"-"+str(X_new[-1].month)+"-"+str(X_new[-1].day)
                return [cw[0].x_name,[start,end]]
                # return [cw[0].x_name,[X_new]]
    elif cw[0].X[0][0]<=three_days_ago:
        for i in range(1,len(cw[0].X[0])):
            if cw[0].X[0][-i]>=three_days_ago:
                continue
            else:
                X_new=list(cw[0].X[0][-i:])
                start=str(X_new[0].year)+"-"+str(X_new[0].month)+"-"+str(X_new[0].day)
                end=str(X_new[-1].year)+"-"+str(X_new[-1].month)+"-"+str(X_new[-1].day)
                return [cw[0].x_name,[start,end]]
                # return [cw[0].x_name,[X_new]]
    else:
        print "tem_filter error"

def cat_filter(cw):
    if ',' in cw[0].X[0][0]:
        index_maxY=cw[0].Y[0].index(max(cw[0].Y[0]))
        if index_maxY<=9:
            X_new=list(cw[0].X[0][0:10])
        elif index_maxY>=len(cw[0].Y[0])-10:
            X_new=list(cw[0].X[0][-10:])
        else:
            X_new=list(cw[0].X[0][index_maxY-5:index_maxY+5])
        if X_new:
            numstart=float(X_new[0].split(',')[0])
            numend=float(X_new[-1].split(',')[1])
            return [cw[0].x_name,[numstart,numend]]
    else:
        index_maxY=list()
        Ytopk=qselect(cw[0].Y[0],10)
        for i in Ytopk:
            index_maxY.append(cw[0].Y[0].index(i))
        X_new=list()
        for i in  index_maxY:
            X_new.append(unicode(cw[0].X[0][i], encoding="utf-8"))
        return [cw[0].x_name,X_new]

#topk
def qselect(A,k):
    if len(A)<k:return A
    pivot = A[-1]
    right = [pivot] + [x for x in A[:-1] if x>pivot]
    rlen = len(right)
    if rlen==k:
        return right
    if rlen>k:
        return qselect(right, k)
    else:
        left = [x for x in A[:-1] if x<pivot]
        return qselect(left, k-rlen) + right
