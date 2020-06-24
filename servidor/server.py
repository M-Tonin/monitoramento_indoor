import codecs
import mySqlLib_Server as sql
import jsonLib_Server as js
import server_utils as util
import ttn
from flask import Flask, jsonify, request
from flask_json import FlaskJSON, JsonError, json_response, as_json

# flask namespace
app = Flask(__name__)

# ttn variables
appId = 'monitoramento-indoor'
accessKey = 'ttn-account-v2.L0jlR9qu-OzefvHzRzBq6SjaA6jPx8gBPfdo-6aLg4c'

# mysql variables
host = 'localhost'
user = 'root'
password = ''
database = 'db_indoor'

freq = 0

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
util.mysqlConn = sql.dbConnect (host, user, password, database)
if util.mysqlConn != None:
  print ('Connected to database.')
else:
  print ('Failed to connect to database.')
cursor = util.mysqlConn.cursor ()

# setup is done, entering flask routes section
print ('Listening...')

# graph data request
@app.route ('/upWifi')
def upWifi ():
  temp = request.args.get ('temp')
  lux = request.args.get ('lux')
  util.callInsert (2, temp, lux)

  dataFreq = {
    'freq': freq
  }
  freq = 0
  return dataFreq

# first request upon launching application main page:
#   id, name, localization, light status from each device
#   last entry
#   temperature difference between both devices
@app.route ('/devices')
def devices ():
  resp1 = sql.dbSelectFromQuery(cursor,sql.SEL_DISP_ULT_TEMP);
  dict1 = js.generateDispositivosPkg(resp1)
  resp2 = sql.dbSelectFromQuery(cursor,sql.SEL_TEMP_OC,sql.WH+" id_ocorrencia = "+
                                   "("+sql.SEL_MAX_OC+")"+sql.E+sql.ULT_24_HORAS);
  dict2 = js.generateUltTempJsonPkg(resp2);
  idDisp1 = sql.dbSelectFromQuery(cursor,sql.SEL_MIN_DISP,sql.WH_ST_DISP.format("'A'"))
  idDIsp2 = sql.dbSelectFromQuery(cursor,sql.SEL_MAX_DISP,sql.WH_ST_DISP.format("'A'"))

  resp3 = sql.dbSelectFromQueryUnion(cursor,[[sql.SEL_TEMP_HR_OC,sql.WH_MAX_OC_DISP.format(idDisp1[0][0])+sql.E+sql.ULT_24_HORAS],
                                             [sql.SEL_TEMP_HR_OC,sql.WH_MAX_OC_DISP.format(idDIsp2[0][0])+sql.E+sql.ULT_24_HORAS]])
  dict3 = js.generateDiffTempJsonPkg(resp3)
  resp = js.concatDicts([dict1,dict2,dict3])
  return util.answer (200, resp)

# all temperature readings from last 24h
@app.route ('/temperatures')
def temperatures ():
  data = request.get_json ()
  resp1 = sql.dbSelectFromQuery(cursor,sql.SEL_ALL_OCS,sql.WH_DISP.format(int(data))+sql.E+sql.ULT_24_HORAS)
  dict1 = js.generateOcorrenciaPkg(resp1)
  resp = dict1

  return util.answer (200, resp)

# device frequency request
@app.route ('/frequency')
def frequency ():
  data = request.get_json ()
  resp1 = sql.dbSelectFromQuery(cursor,sql.SEL_FREQ_DISP,sql.WH_DISP.format(int(data)))
  dict1 = js.generateFreqDispJsonPkg(resp1)
  resp = dict1
  
  return util.answer (200, resp)

# change device frequency
@app.route ('/updateFreq', methods = ['GET',"POST"])
def updateFreq ():
  data = request.get_json ()

  try:
    key = int (data ['key'])
    frequencia = int (data ['frequencia'])
  except (KeyError, TypeError, ValueError):
    resp = jsonify (success = False)
    return util.answer (444, resp)

  sql.dbInsert (cursor, f'INSERT INTO tb_dispositivos WHERE {id_dispositivo} BLABLABLA')
  freq = frequencia
  
  resp = jsonify (success = True)
  return util.answer (200, resp)

# online
if __name__ == '__main__':
  app.run (host = '0.0.0.0', debug = True)