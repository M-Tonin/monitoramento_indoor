import codecs
import ttn
import mySql_Server as mysqlServer

appId = 'monitoramento-indoor'
accessKey = 'ttn-account-v2.L0jlR9qu-OzefvHzRzBq6SjaA6jPx8gBPfdo-6aLg4c'
devId = 'dispositivo1'

mysqlConnection = None
mysqlCursor = None
host = 'localhost'
user = 'root'
password = ''
database = 'testedb'

class tb_ocorrencia:
  def __init__(self, idD, tmp, lmi, stLu):
    self.id_dispositivo = idD
    self.vl_temperatura = tmp 
    self.vl_luminosidade = lmi
    self.dt_ocorrencia = 'CURRENT_DATE'
    self.hr_ocorrencia = 'CURRENT_TIME'
    self.st_luminosidade = stLu

def uplinkCallback (msg, client):
  global mysqlConnection
  print ('Uplink received from: ', msg.dev_id)
  print ('Brightness: ' + msg.payload_fields [0])
  print ('Temperature: ' + msg.payload_fields [1])
  print ('FULL PAYLOAD: ' + str (msg))

  oc = tb_ocorrencia (1, float (msg.payload_fields [1] [0 : -3]), int (msg.payload_fields [0] [0 : -3]), 'S')
  mysqlServer.dbInsertObj (mysqlCursor, oc)
  mysqlConnection.commit ()

def downlinkCallback (mid, client):
  print ('Downlink sent. ID: ' + str (mid))

handler = ttn.HandlerClient (appId, accessKey)
mqttClient = handler.data ()
appClient = handler.application ()

mqttClient.set_uplink_callback (uplinkCallback)
mqttClient.set_downlink_callback (downlinkCallback)

try:
  mqttClient.connect ()
  print ('Connected to TTN.')
except:
  print ('Failed to connect to TTN.')
  input ()
  raise Exception ('Closing program...')

mysqlConnection = mysqlServer.dbStart (host, user, password, database)
if mysqlConnection != None:
  print ('Connected to database.')
else:
  print ('Failed to connect to database.')
  input ()
  raise Exception ('Closing program...')

mysqlCursor = mysqlConnection.cursor ()

print ('\nEnter QUIT to disconnect.')
print ('Enter SEND to send Downlink.')

cmd = 0
while cmd != 'quit':
  cmd = input ()

  if cmd == 'send':
    print ('Enter payload for downlink: ')
    downlink = input ()
    downlink = codecs.encode (codecs.decode (downlink, 'hex'), 'base64').decode ()
    mqttClient.send (devId, downlink, 1, False, 'replace')

print ('Closing program...')
mqttClient.close ()
mysqlConnection.close ()