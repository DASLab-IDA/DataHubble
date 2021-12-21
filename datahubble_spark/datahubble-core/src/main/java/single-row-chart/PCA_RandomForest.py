from impala.dbapi import connect
import normalized
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import PCA
from sklearn import preprocessing

args = ["path", "10.141.212.155", 10010, "", "", "bigbench_100g", "websales_home_myshop"]
dbArgs = args[1:6]
conn = connect(host=dbArgs[0], port=dbArgs[1], database=dbArgs[4], auth_mechanism='PLAIN')
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

# k=cur.fetchone()
des = cur.description
D = []
# D = map(list, cur.fetchall())
D = np.array(cur.fetchall())
cur.close()
conn.close()

rec_column = []
feat_labels = []

for i in des:
    c = des.index(i)
    if 'STR' in i[1] or 'str' in i[1]:
        if len(D[0][c]) >= 20:
            rec_column.append(0.5)
        else:
            rec_column.append(0)
    else:
        rec_column.append(0)
x = D
xdes = des
count = 0
for i in range(len(rec_column)):
    if rec_column[i] == 0.5 or rec_column[i] == 1:
        j = i - count
        x = np.delete(x, j, axis=1)
        del xdes[j]
        count += 1
for i in range(len(xdes)):
    feat_labels.append(des[i][0])
# normalized x
for i in range(len(xdes)):
    if 'double' in xdes[i][1].lower() or 'float' in xdes[i][1].lower() or 'int' in xdes[i][1].lower():
        continue
    elif 'str' in xdes[i][1].lower() or 'text' in xdes[i][1].lower():
        normalized.DealWithStr(x, i)
    elif 'data' in xdes[i][1].lower() or 'time' in xdes[i][1].lower():
        normalized.DealWithTime(x, i)
x_scale = preprocessing.scale(x)

# kpca = KernelPCA(n_components=1,kernel="rbf", fit_inverse_transform=True, gamma=10)
# y=X_kpca = kpca.fit_transform(x)
pca_de_num = 2
pca = PCA(n_components=pca_de_num)
X_pca = pca.fit_transform(x)
y = X_pca.astype('int')

y_col_num=y.shape[1]
for i in range(y_col_num):
    forest = RandomForestClassifier(n_estimators=50, random_state=0, n_jobs=-1)
    # forest.fit(x_train, y_train)
    yi=y[:,i]
    forest.fit(x_scale, yi)
    if (i==0):
        importances = forest.feature_importances_
    else:
        importance = forest.feature_importances_
        importances=np.vstack((importances,importance))
if importances.shape.__len__()==1:
    indices = np.argsort(importances)[::-1]
    for f in range(x.shape[1]):
        print("%2d) %-*s %f" % (f + 1, 30, feat_labels[indices[f]], importances[indices[f]]))
else:
    importances_avg=np.mean(importances,axis=0)
    indices = np.argsort(importances_avg)[::-1]
    for f in range(x.shape[1]):
        print("%2d) %-*s %f" % (f + 1, 30, feat_labels[indices[f]], importances_avg[indices[f]]))
