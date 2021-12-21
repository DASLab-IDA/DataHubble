# -*- coding: UTF-8 -*-
import requests
from requests.auth import HTTPBasicAuth
import json
import sys

# CONNECT TO Hbase
url = 'http://master:7070/kylin/api/query'
systemargs = sys.argv
tableName = systemargs[1] + '_10'
tableName = "WEBSALES_HOME_10"
payload = {
    "sql": "select * from" + " "+tableName,
    "project": "bigbench1"
}
json_payload = json.dumps(payload)
headers = {'Content-Type': 'application/json',
           'Authorization': 'Basic QURNSU46S1lMSU4='}
response = requests.post(url, json_payload, headers=headers, auth=HTTPBasicAuth('ADMIN', 'KYLIN'))
print 'hbase connect status'+str(response.status_code)
data=json.loads(response.content)
print data['columnMetas']



