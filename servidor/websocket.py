import codecs
import socket
import threading
from _thread import *

printlock = threading.Lock ()
downlink = b'6a'

def threaded (c):
  global downlink

  while True:
    data = c.recv (1024)

    if not data:
      printlock.release ()
      break

    print (f'Data received: {data.hex ()}')
    print ('Sending downlink...', str (downlink.decode ('ascii')))

    c.send (downlink)

  c.close ()

def main ():
  host = ''

  port = 12345
  s = socket.socket (socket.AF_INET, socket.SOCK_STREAM)
  s.bind ((host, port))
  print ("WebSocket binded to port:", port)

  s.listen(5)
  print("WebSocket is listening...")

  while True:
    c, addr = s.accept ()
    printlock.acquire ()
    print ('Connected to: {} : {}'.format (addr[0], addr[1]))

    start_new_thread (threaded, (c,))

  s.close ()

if __name__ == '__main__':
    main ()