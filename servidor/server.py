import codecs
import mySql_Server as mysqls
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
database = 'testedb'

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
util.mysqlConn = mysqls.dbStart (host, user, password, database)
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
  resp1 = mysqls.dbSelect (cursor, 'SELECT FROM database tb_dispositivos VALUES (id_dispositivo, no_dispositivo, no_localizacao, st_luminosidade);')
  resp2 = mysqls.dbSelect (cursor, 'última temperatura registrada, independente de qual dispositivo mandou')
  resp3 = mysqls.dbSelect (cursor, 'diferença de temperatura e hora')

  resp = resp1 + ', ' + resp2 + ', ' + resp3
  return util.answer (200, resp)

# all temperature readings from last 24h
@app.route ('/temperatures')
def temperatures ():
  data = request.get_json ()
  resp = mysqls.dbSelect (cursor, 'SELECT data.id_dispositivo, hr_ocorrencia FROM tb_ocorrencia WHERE hr_ocorrencia >= CURRENT_TIME - 24;')

  return util.answer (200, resp)

# device frequency request
@app.route ('/frequency')
def frequency ():
  data = request.get_json ()
  resp = mysqls.dbSelect (cursor, f'{data.id_dispositivo}')
  
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

  mysqls.dbInsert (cursor, f'INSERT INTO tb_dispositivos WHERE {id_dispositivo} BLABLABLA')
  freq = frequencia
  
  resp = jsonify (success = True)
  return util.answer (200, resp)

# online
if __name__ == '__main__':
  app.run (host = '0.0.0.0', debug = True)
