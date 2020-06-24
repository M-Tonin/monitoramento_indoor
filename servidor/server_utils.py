import mySql_Server as mysqls
import ttn

mysqlConn = None
LIGHTING_THRESHOLD = 200

# generate mysql object and insert into mysql database
def callInsert (d, t, l):
  s = 0
  if l > LIGHTING_THRESHOLD:
    s = 1

  occ = mysqls.tb_ocorrencia (d, t, l, s)
  mysqls.dbInsertObj (mysqlConn.cursor (), occ)
  mysqlConn.commit ()

# convert received data from wifi device to proper temperature and lighting values
# DEPRECATED-
def bytesToInt (b):
  aux = 0
  for i in b:
	  aux = (aux << 8) | i
	
  temperature = (aux >> 16) / 10
  lighting = aux & 0x0000FFFF
  callInsert (2, temperature, lighting)

# ttn uplink callback function
# also automatically sends an insert onto the database with the received uplink
def uplinkCallback (msg, client):
  print ('Uplink received from: ', msg.dev_id)
  print ('PAYLOAD: ' + str (msg))

  callInsert (1, float (msg.payload_fields [1] [0 : -3]), int (msg.payload_fields [0] [0 : -3]))

# ttn downlink callback function
def downlinkCallback (mid, client):
  print ('Downlink sent. ID: ' + str (mid))

def mqttClientSetup (handler):
  client = handler.data ()
  client.set_uplink_callback (uplinkCallback)
  client.set_downlink_callback (downlinkCallback)
  return client

def answer (http_code, json_return):
  responseServer = app.response_class (
    response = json.dumps (json_return),
    status = http_code,
    mimetype = 'application/json'
  )
  return responseServer