import mySqlLib_Server as sql
import ttn

mysqlConn = None
LIGHTING_THRESHOLD = 200

# generate sql insert command from received telemetry data and submit to the database
def callInsert (d, t, l):
  s = 0
  if l > LIGHTING_THRESHOLD:
    s = 1
  s = str (s)

  sql.dbInsertFromQuery (mysqlConn.cursor (), sql.INS_OC.format (d, t, l, s), '')
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

  callInsert (2, float (msg.payload_fields [1] [0 : -3]), int (msg.payload_fields [0] [0 : -3]))

# ttn downlink callback function
def downlinkCallback (mid, client):
  print ('Downlink sent. ID: ' + str (mid))

def mqttClientSetup (handler):
  client = handler.data ()
  client.set_uplink_callback (uplinkCallback)
  client.set_downlink_callback (downlinkCallback)
  return client

def answer (app, http_code, json):
  responseServer = app.response_class (
    response = json,
    status = http_code,
    mimetype = 'application/json'
  )
  return responseServer