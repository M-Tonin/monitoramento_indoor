import mySqlLib_Server as sql
import dictTreatLib_Server as dt
import json
import server_utils as util
import ttn
from flask import Flask, jsonify, request
from flask_json import FlaskJSON, JsonError, json_response, as_json
from flask_ngrok import run_with_ngrok

# flask namespace
app = Flask (__name__)
run_with_ngrok (app)

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

# setup is done; entering flask routine section
print ('Listening...')

# uplink received from wifi device
@app.route ('/upWifi')
def upWifi ():
  global freq
  temp = float (request.args.get ('temp')) / 10
  lux = int (request.args.get ('lux'))

  util.callInsert (2, temp, lux)
  print (f'FREQ = {freq}')
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
  idDisp1 = sql.dbSelectFromQuery (cursor, sql.SEL_MIN_DISP, 
                                           sql.WH_ST_DISP.format ("'A'"))
  idDisp2 = sql.dbSelectFromQuery (cursor, sql.SEL_MAX_DISP, 
                                           sql.WH_ST_DISP.format ("'A'"))
  resp1 = sql.dbSelectFromQuery (cursor, sql.SEL_DISP_ULT_LUM.format(idDisp1[0][0],idDisp2[0][0]), '')
  dict1 = dt.getDispositivosDict (resp1)
  resp2 = sql.dbSelectFromQuery (cursor, sql.SEL_ULT_TEMP_DT_HR, '')
  dict2 = dt.getUltTempDict (resp2)
  resp3 = sql.dbSelectFromQueryUnion (cursor, [[sql.SEL_TEMP_HR_OC, 
                                                sql.WH_MAX_OC_DISP.format (idDisp1 [0] [0]) + sql.AND + 
                                                sql.ULT_24_HORAS],
                                               [sql.SEL_TEMP_HR_OC, 
                                                sql.WH_MAX_OC_DISP.format (idDisp2 [0] [0]) + sql.AND + 
                                                sql.ULT_24_HORAS]])
  dict3 = dt.getDiffTempDict (resp3)

  resp = json.dumps (dt.concatDicts ([dict1, dict2, dict3]), indent = 4, separators = (", "," : "))
  return util.answer (app, 200, resp)

# all temperature readings from last 24h
@app.route ('/temperatures')
def temperatures ():
  data = request.get_json ()
  resp1 = sql.dbSelectFromQuery (cursor, sql.SEL_ALL_OCS, 
                                         sql.WH_DISP.format (data ['id_dispositivo']) + sql.AND + 
                                         sql.ULT_24_HORAS)
  dict1 = json.dumps (dt.getOcorrenciaDict (resp1), indent = 4, separators = (", "," : "))
  return util.answer (app, 200, dict1)

# device frequency request
@app.route ('/frequency')
def frequency ():
  data = request.get_json ()
  resp1 = sql.dbSelectFromQuery (cursor, sql.SEL_FREQ_DISP, 
                                         sql.WH_DISP.format (data ['id_dispositivo']))

  dict1 = json.dumps (dt.getFreqDispDict (resp1), indent = 4, separators = (", "," : "))
  return util.answer (app, 200, dict1)

# change device frequency
@app.route ('/updateFreq', methods = ['GET',"POST"])
def updateFreq ():
  global freq
  data = request.get_json ()

  try:
    key = data ['id_dispositivo']
    frequencia = data ['nova_frequencia']
  except (KeyError, TypeError, ValueError):
    resp = jsonify (success = False)
    return util.answer (app, 444, resp)

  if key == 1 and frequencia > 0:
    util.callSendToTTN (mqttClient, 'dispositivo1', frequencia)
  else:
    freq = frequencia

  if (sql.dbExecQuery (cursor, sql.UPD_FREQ_DISP.format (frequencia),
                            sql.WH_DISP.format (key))):  
    resp = jsonify (success = True)
    util.mysqlConn.commit ()
  else:
    resp = jsonify (success = False)
  
  return resp

@app.route ('/')
def debug ():
  return 'DEBUG-'

# online
if __name__ == '__main__':
  app.run ()
