import dictTreatLib_Server as dt
import json
import mySqlLib_Server as sql
import server_utils as util
import ttn
from flask import Flask, jsonify, request
from flask_json import FlaskJSON, JsonError, json_response, as_json
#from flask_ngrok import run_with_ngrok

# flask namespace
app = Flask (__name__)
#run_with_ngrok (app)

# ttn variables
appId = 'monitoramento-indoor'
accessKey = 'ttn-account-v2.L0jlR9qu-OzefvHzRzBq6SjaA6jPx8gBPfdo-6aLg4c'

# mysql variables
host = 'localhost'
user = 'root'
password = '#IBTI@2019'
database = 'db_indoor'

# connect to ttn iot platform
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
#util.mysqlConn = sql.dbConnect (host, user, password, database)
#if util.mysqlConn != None:
  #print ('Connected to database.')
#else:
  #print ('Failed to connect to database.')
#cursor = util.mysqlConn.cursor ()

# setup is done; entering flask routine section
print ('Listening...')

# uplink received from wifi device with temperature and lighting values
# ps: it's important to reset util.freq2 variable after send
@app.route ('/upWifi')
def upWifi ():
  with transactionManagement() as tm:
    try:
      temp = float (request.args.get ('temp')) / 10
      lux = int (request.args.get ('lux'))
    except (KeyError, TypeError, ValueError):
      return jsonify (success = False)

    print ('Uplink received from: WiFi.')
    print (f'PAYLOAD: {str (lux)} Lux, {str (temp)} °C.\n\n')
    
    util.callInsert (2, temp, lux)
  
    if (util.freq2 != 0):
      util.callUpdateFreq (2)
      print ('WiFi device frequency has been updated on the database.')
      check = True
    else:
      check = False

    dataFreq = {
      'freq': util.freq2
    }
    if check:
      util.freq2 = 0
    return jsonify (dataFreq)

# uplink received from wifi device with light status event info
@app.route ('/lightStatus')
def lightStatus ():
  with transactionManagement() as tm:
    try:
      lightstatus = int (request.args.get ('lightstatus'))
    except (KeyError, TypeError, ValueError):
      return jsonify (success = False)

    try:
      sql.dbExecQuery (tm, sql.INS_LIGHT_STATUS.format (2, lightstatus), '')
      return jsonify (success = True)
    except:
      print ('Error: failed to insert Light Status onto database.')
      return jsonify (success = False)

# first request upon launching application main page:
#   id, name, localization, light status from each device
#   last entry
#   temperature difference between both devices
@app.route ('/devices')
def devices ():
  with queryManagement() as qm:
    try:
      idDisp1 = sql.dbSelectFromQuery (qm, sql.SEL_MIN_DISP, 
                                              sql.WH_ST_DISP.format ("'A'"))
      idDisp2 = sql.dbSelectFromQuery (qm, sql.SEL_MAX_DISP, 
                                              sql.WH_ST_DISP.format ("'A'"))
      resp1 = sql.dbSelectFromQuery (qm, sql.SEL_DISP_ULT_LUM.format (idDisp1 [0] [0], idDisp2 [0] [0]), '')
      dict1 = dt.getDispositivosDict (resp1)
      resp2 = sql.dbSelectFromQuery (qm, sql.SEL_ULT_TEMP_DT_HR, '')
      dict2 = dt.getUltTempDict (resp2)
      resp3 = sql.dbSelectFromQueryUnion (qm, [[sql.SEL_TEMP_HR_OC, 
                                                    sql.WH_MAX_OC_DISP.format (idDisp1 [0] [0]) + sql.AND + 
                                                    sql.ULT_24_HORAS],
                                                  [sql.SEL_TEMP_HR_OC, 
                                                    sql.WH_MAX_OC_DISP.format (idDisp2 [0] [0]) + sql.AND + 
                                                    sql.ULT_24_HORAS]])
      dict3 = dt.getDiffTempDict (resp3)

      resp = json.dumps (dt.concatDicts ([dict1, dict2, dict3]), indent = 4, separators = (", "," : "))
      return util.answer (app, 200, resp)
    except:
      print (f'Error while trying to gather information from all devices.')
      return jsonify (success = False)

# all temperature readings from last 24h
@app.route ('/temperatures', methods = ['GET',"POST"])
def temperatures ():
  with queryManagement() as qm:
    try:
      data = request.get_json ()
    except (KeyError, TypeError, ValueError):
      return jsonify (success = False)

    try:
      resp1 = sql.dbSelectFromQuery (qm, sql.SEL_ALL_OCS, 
                                            sql.WH_DISP.format (data ['id_dispositivo']) + sql.AND + 
                                            sql.ULT_24_HORAS + "\nLIMIT 192")
      dict1 = (dt.getOcorrenciaDict (resp1))
      resp_freq = sql.dbSelectFromQuery (qm, sql.SEL_FREQ_DISP, 
                                                sql.WH_DISP.format (data ['id_dispositivo']))
      dict_freq = (dt.getFreqDispDict (resp_freq))
      dict1.update (dict_freq)
      resp = json.dumps (dt.concatDicts([dict1,dict_freq]), indent = 4, separators = (", "," : "))
      return util.answer (app, 200, resp)
    except:
      d = data ['id_dispositivo']
      print (f'Error: device {d} not found.')
      return jsonify (success = False)

# device frequency request
@app.route ('/frequency')
def frequency ():
  with queryManagement as qm:
    try:
      data = request.get_json ()
    except (KeyError, TypeError, ValueError):
      return jsonify (success = False)

    try:
      resp1 = sql.dbSelectFromQuery (qm, sql.SEL_FREQ_DISP, 
                                            sql.WH_DISP.format (data ['id_dispositivo']))

      dict1 = json.dumps (dt.getFreqDispDict (resp1), indent = 4, separators = (", "," : "))
      return util.answer (app, 200, dict1)
    except:
      return jsonify (success = False)

# change device frequency
@app.route ('/updateFreq', methods = ['GET','POST'])
def updateFreq ():
  try:
    data = request.get_json ()
    key = data ['id_dispositivo']
    frequencia = data ['nova_frequencia']
  except (KeyError, TypeError, ValueError):
    return jsonify (success = False)

  if key == 1 and frequencia > 0:
    util.freq1 = frequencia
    util.callSendToTTN (mqttClient, 'dispositivo1', frequencia)
  else:
    util.freq2 = frequencia
    print ('Downlink scheduled to WiFi device.')

  return jsonify (success = True)

@contextmanager
	def transactionManagement (self):
		try:
			util.mysqlConn = sql.dbConnect (host, user, password, database)
      cursor =util.mysqlConn.cursor()
      yield cursor
		except:
			raise
		finally:
			util.mysqlConn.commit()
      cursor.close()
      util.mysqlConn.close()
      print('Conexão com o banco finalizada.')

@contextmanager
	def queryManagement (self):
		try:
			util.mysqlConn = sql.dbConnect (host, user, password, database)
      cursor = util.mysqlConn.cursor()
      yield cursor
		except:
			raise
		finally:
      cursor.close()
      util.mysqlConn.close()

      print('Conexão com o banco finalizada.')




# online
if __name__ == '__main__':
  app.run (host = '0.0.0.0')
