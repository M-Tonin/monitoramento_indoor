import codecs
import mySql_Server as mysqls
import server_utils as util
import ttn
from flask import Flask, jsonify, request

app = Flask(__name__)

# ttn variables
appId = 'monitoramento-indoor'
accessKey = 'ttn-account-v2.L0jlR9qu-OzefvHzRzBq6SjaA6jPx8gBPfdo-6aLg4c'

# mysql variables
host = 'localhost'
user = 'root'
password = ''
database = 'testedb'

# DEBUG
dataJson = '{    "ocorrencias":[        {            "id_ocorrencia":1,            "id_dispositivo":1,            "vl_temperatura":26.5,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"10:57:24"        },        {            "id_ocorrencia":2,            "id_dispositivo":1,            "vl_temperatura":25.2,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"10:58:24"        },        {            "id_ocorrencia":3,            "id_dispositivo":1,            "vl_temperatura":26.6,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"10:59:24"        },        {            "id_ocorrencia":4,            "id_dispositivo":1,            "vl_temperatura":25.3,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:00:24"        },        {            "id_ocorrencia":5,            "id_dispositivo":1,            "vl_temperatura":27.7,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:01:24"        },        {            "id_ocorrencia":6,            "id_dispositivo":1,            "vl_temperatura":28.4,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:02:24"        },        {            "id_ocorrencia":7,            "id_dispositivo":1,            "vl_temperatura":25.8,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:03:24"        },        {            "id_ocorrencia":8,            "id_dispositivo":2,            "vl_temperatura":26.5,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:04:24"        },        {            "id_ocorrencia":9,            "id_dispositivo":1,            "vl_temperatura":25.2,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:05:24"        },        {            "id_ocorrencia":10,            "id_dispositivo":1,            "vl_temperatura":26.1,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:06:24"        },        {            "id_ocorrencia":11,            "id_dispositivo":2,            "vl_temperatura":24.8,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:07:24"        },        {            "id_ocorrencia":12,            "id_dispositivo":1,            "vl_temperatura":26.5,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:08:24"        },        {            "id_ocorrencia":13,            "id_dispositivo":2,            "vl_temperatura":24.3,            "vl_luminosidade":400,            "dt_ocorrencia":"2020-06-22",            "hr_ocorrencia":"11:09:24"        }    ],    "ultimoRegDips1":{        "id_ocorrencia":12,        "id_dispositivo":1,        "vl_temperatura":26.5,        "vl_luminosidade":400,        "dt_ocorrencia":"2020-06-22",        "hr_ocorrencia":"11:08:24"    },    "ultimoRegDips2":{        "id_ocorrencia":13,        "id_dispositivo":2,        "vl_temperatura":24.3,        "vl_luminosidade":400,        "dt_ocorrencia":"2020-06-22",        "hr_ocorrencia":"11:09:24"    }}'

# connect to ttn iot application
try:
  handler = ttn.HandlerClient (appId, accessKey)
  mqttClient = util.mqttClientSetup (handler)
except:
  print ('Failed to mount TTN handler.')

try:
  mqttClient.connect ()
  print ('Connected to TTN.')
except:
  print ('Failed to connect to TTN.')

# connect to mysql database
util.mysqlConn = mysqls.dbStart (host, user, password, database)
if util.mysqlConn != None:
  print ('Connected to database.')
else:
  print ('Failed to connect to database.')

# setup is done, entering flask routes section
print ('Listening...')

# graph data request
@app.route ('/graph_data')
def graph_data ():
  resp = jsonify (dataJson)
  resp.status_code = 200
  return resp

# change device frequency
@app.route ('/downlink', methods = ['GET',"POST"])
def downlink ():
  data = request.get_json ()
  
  resp = jsonify (success = True)
  resp.status_code = 200
  return resp

# online
if __name__ == '__main__':
  app.run (host = '0.0.0.0', debug = True)
