import codecs
import mySqlLib_Server as sql
import ttn

# mysql connection to be received by the main program
mysqlConn = None

# this value must be in sync with the database
LIGHTING_THRESHOLD = 70

# downlink frequency control per device
freq1 = 0
freq2 = 0

# myqsl insert function
# generate sql insert command from received telemetry data and submit to the database
def callInsert (d, t, l):
  s = 0
  if l > LIGHTING_THRESHOLD:
    s = 1
  s = str (s)

  sql.dbInsertFromQuery (mysqlConn.cursor (), sql.INS_OC.format (d, t, l, s), '')
  mysqlConn.commit ()

# ttn downlink send function
# automatically adjusts payload bytes in length and useful information and sends to ttn
def callSendToTTN (client, device, downlink):
  downlink = hex (downlink)

  if len (downlink) % 2 == 1:
    downlink = '0' + downlink [2:]
  else:
    downlink = downlink [2:]

  downlink = codecs.encode (downlink)
  downlink = codecs.encode (codecs.decode (downlink, 'hex'), 'base64').decode ()
  
  client.send (device, downlink, port=1, conf=False, sched="replace")

# update device frequency on database on downlink send
def callUpdateFreq (key):
  global freq1
  global freq2
  
  if key == 1:
    f = freq1
    freq1 = 0
  else:
    f = freq2
    freq2 = 0

  sql.dbExecQuery (mysqlConn.cursor (), sql.UPD_FREQ_DISP.format (f), sql.WH_DISP.format (key))
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
  temp = msg.payload_fields [1] [0 : -3]
  lux = msg.payload_fields [0] [0 : -3]

  print (f'Uplink received from: {msg.dev_id}.')
  print (f'PAYLOAD: {lux} Lux, {temp} °C.\n')

  callInsert (1, float (temp), int (lux))

  if freq1 != 0:
    callUpdateFreq (1)
    print ('LoRa device frequency has been updated on the database.')

# ttn downlink callback function
def downlinkCallback (mid, client):
  print (f'Downlink scheduled to TTN. ID: {str (mid)}.')

# mqtt client setup
# receives the connection to ttn
# mounts all callbacks according to this library and returns the mqtt client data
def mqttClientSetup (handler):
  client = handler.data ()
  client.set_uplink_callback (uplinkCallback)
  client.set_downlink_callback (downlinkCallback)
  return client

# http answer builder function
def answer (app, http_code, json):
  responseServer = app.response_class (
    response = json,
    status = http_code,
    mimetype = 'application/json'
  )
  return responseServer