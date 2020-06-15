import time
import ttn

appId = 'monitoramento-indoor'
accessKey = 'ttn-account-v2.L0jlR9qu-OzefvHzRzBq6SjaA6jPx8gBPfdo-6aLg4c'

handler = ttn.HandlerClient (appId, accessKey)
mqttClient = handler.data ()
appClient = handler.application ()

def uplinkCallback (msg, client):
  print ('Uplink received from: ', msg.dev_id)
  print (msg)

def downlinkCallback (msg, client):
  print ('Downlink sent to:', msg.dev_id)
  print (msg)

mqttClient.set_uplink_callback (uplinkCallback)
mqttClient.set_downlink_callback (downlinkCallback)

try:
  mqttClient.connect ()
  print ('Connected to TTN.')
except:
  print ('Failed to connect to TTN.')

print ('Press any key to disconnect.')
input ()
mqttClient.close ()