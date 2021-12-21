import numpy as np
import pandas as pd
import normalized
from impala.dbapi import connect
from sklearn.ensemble import RandomForestClassifier
from sklearn import preprocessing
import thread


# args=["path","10.141.212.118", 10010, "" ,"" ,"bigbench" ,"web_sales_home1"]
# dbArgs = args[1:6]
#
# conn = connect(host=dbArgs[0], port=dbArgs[1], database=dbArgs[4],auth_mechanism='PLAIN')
# cur=conn.cursor()
# cur.execute("SELECT * FROM "+args[6])
# des=cur.description
# D=[]
# # D = map(list, cur.fetchall())
# D=np.array(cur.fetchall())
# cur.close()
# conn.close()


def keyColumn_RandomForest(D, des):
    # parallel = 10
    D = np.array(D)
    target = 'quantity'
    rec_column = []
    feat_labels = []
    # obtain initial x,y
    for i in des:
        c = des.index(i)
        if target in i[0]:
            rec_column.append(1)
            y = D[:, c]
            for index, item in enumerate(y):
                if item == None:
                    y[index] = y[index - 1]
            y = y.astype(np.int64)
            continue
        if 'STR' in i[1] or 'str' in i[1]:
            if len(D[0][c]) >= 120:
                rec_column.append(0.5)
            else:
                rec_column.append(0)
        else:
            rec_column.append(0)
    x = D[:]
    xdes = list(des)
    count = 0
    for i in range(len(rec_column)):
        if rec_column[i] == 0.5:
            j = i - count
            x = np.delete(x, j, axis=1)
            del xdes[j]
            count += 1
    for i in range(len(xdes)):
        feat_labels.append(xdes[i][0].split(".")[0])

    # normalized x
    for i in range(len(xdes)):
        if 'double' in xdes[i][1].lower() or 'float' in xdes[i][1].lower() or 'int' in xdes[i][1].lower():
            continue
        elif 'str' in xdes[i][1].lower() or 'text' in xdes[i][1].lower():
            normalized.DealWithStr(x, i)
        elif 'data' in xdes[i][1].lower() or 'time' in xdes[i][1].lower():
            normalized.DealWithTime(x, i)
    x_scale = preprocessing.scale(x)

    # normalized y
    y_scale = preprocessing.scale(y)
    y_scale = np.around(np.around(y_scale, decimals=2) * 100)

    # RandomForest obtain features
    forest = RandomForestClassifier(n_estimators=10, random_state=0, n_jobs=-1, max_depth=5)
    forest.fit(x_scale, y_scale)
    importances = forest.feature_importances_
    # xrows_10 = x_scale.shape[0] / 10
    # for i in range(1, 11):
    #     tempx = x_scale[(i - 1) * xrows_10:i * xrows_10:]
    #     tempy = y_scale[(i - 1) * xrows_10:i * xrows_10:]
    #     # thread.start_new_thread(randomForest(tempx,tempy))
    #     # global importances
    #     importances = randomForest(tempx, tempy)
    indices = np.argsort(importances)[::-1]
    for f in range(x.shape[1]):
        print("%2d) %-*s %f" % (f + 1, 30, feat_labels[indices[f]], importances[indices[f]]))
    return feat_labels, indices
