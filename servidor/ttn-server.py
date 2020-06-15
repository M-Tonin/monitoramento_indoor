import codecs
import time
import ttn

appId = 'monitoramento-indoor'
accessKey = 'ttn-account-v2.L0jlR9qu-OzefvHzRzBq6SjaA6jPx8gBPfdo-6aLg4c'
devId = '26011BC0'

handler = ttn.HandlerClient (appId, accessKey)
mqttClient = handler.data ()
appClient = handler.application ()

def b64toHex (msg):
  msg = bytearray (msg, 'utf-8')
  return codecs.encode (codecs.decode (msg, 'base64'), 'hex').decode ()

def uplinkCallback (msg, client):
  print ('Uplink received from: ', msg.dev_id)
  print (msg)
  print ('Payload (HEX): ' + b64toHex (msg.payload_raw))

def downlinkCallback (mid, client):
  print ('Downlink sent: ' + str (mid))

mqttClient.set_uplink_callback (uplinkCallback)
mqttClient.set_downlink_callback (downlinkCallback)

try:
  mqttClient.connect ()
  print ('Connected to TTN.')
except:
  print ('Failed to connect to TTN.')
  input ()
  raise Exception ('Closing program...')

print ('Enter QUIT to disconnect.')
print ('Enter SEND to send Downlink.')

cmd = 0
while cmd != 'quit':
  cmd = input ()

  if cmd == 'send':
    mqttClient.send (devId, '01', 1, False, 'replace')

print ('Closing program...')
mqttClient.close ()