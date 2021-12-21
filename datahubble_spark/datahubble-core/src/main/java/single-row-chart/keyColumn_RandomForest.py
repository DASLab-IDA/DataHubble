import numpy as np
import pandas as pd
import normalized
from impala.dbapi import connect
from sklearn.ensemble import RandomForestClassifier
from sklearn import preprocessing
import thread

def keyColumn_RandomForest(D, des, target_col):
    D = np.array(D)
    rec_column = []
    feat_labels = []
    # obtain initial x,y
    for i in des:
        c = des.index(i)
        if target_col in i[0]:
            rec_column.append(1)
            y = D[:, c]
            for index, item in enumerate(y):
                if item == None:
                    y[index] = y[index - 1]
            # y = y.astype(np.int64)
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

    # delete column if rec_column[i] == 0.5
    count = 0
    for i in range(len(rec_column)):
        if rec_column[i] == 0.5:
            j = i - count
            x = np.delete(x, j, axis=1)
            del xdes[j]
            count += 1
    for i in range(len(xdes)):
        feat_labels.append(xdes[i][0].split(".")[0])

    # deal with types
    for i in range(len(xdes)):
        if 'double' in xdes[i][1].lower() or 'float' in xdes[i][1].lower() or 'int' in xdes[i][1].lower():
            continue
        elif 'str' in xdes[i][1].lower() or 'text' in xdes[i][1].lower():
            normalized.DealWithStr(x, i)
        elif 'data' in xdes[i][1].lower() or 'time' in xdes[i][1].lower():
            normalized.DealWithTime(x, i)
    # normalized x
    x_scale = preprocessing.scale(x)

    # normalized y
    y_scale = preprocessing.scale(y)
    y_scale = np.around(np.around(y_scale, decimals=2) * 100)

    # RandomForest obtain features
    forest = RandomForestClassifier(n_estimators=10, random_state=0, n_jobs=-1, max_depth=5)
    forest.fit(x_scale, y_scale)
    importances = forest.feature_importances_

    indices = np.argsort(importances)[::-1]
    ans=""
    for f in range(x.shape[1]):
        temp = ("%2d) %-*s %f" % (f + 1, 30, feat_labels[indices[f]], importances[indices[f]]))
        print temp
        ans += "&" + temp
    return feat_labels, indices, ans
