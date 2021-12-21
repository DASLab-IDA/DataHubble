from sklearn.preprocessing import LabelEncoder
import time
import datetime
import numpy as np
# def DealWithNum(x,col_num):

def DealWithStr(x, col_num):
    label_encoder = LabelEncoder()
    x[:, col_num] = label_encoder.fit_transform(x[:, col_num])
    x[:, col_num]=x[:, col_num].astype(np.float64)


def DealWithTime(x, col_num):
    d = {}
    for i in range(x.shape[0]):
        if x[i, col_num] in d:
            d[x[i, col_num]] += 1
        else:
            d[x[i, col_num]] = 1
    keys = d.keys()
    keys = sorted(keys, date_compare)
    d={}
    for i in range(len(keys)):
        d[keys[i]]=i
    for i in range(x.shape[0]):
        x[i, col_num]=d[x[i, col_num]]


def date_compare(time1, time2):
    if type(time1)== type(datetime.date(1995,10,11)):
        t1 = time.mktime(time1)
        t2 = time.mktime(time2)
    else:
        t1=time1
        t2=time2
    if t1 < t2:
        return -1
    elif t1 > t2:
        return 1
    else:
        return 0
