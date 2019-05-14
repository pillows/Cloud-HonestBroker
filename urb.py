import socket

URB_SOCKET = socket.socket()
URB_SOCKET.bind(('', 'PORT'))

VMS = [
    { 'IP': '172.17.12.3', 'NAME': '1-1' },
    { 'IP': '172.17.12.4', 'NAME': '1-2' },
    { 'IP': '172.17.12.5', 'NAME': '1-3' },
    { 'IP': '172.17.11.4', 'NAME': '2-4' },
    { 'IP': '172.17.11.5', 'NAME': '2-5' },
    { 'IP': '172.17.11.6', 'NAME': '2-6' },
    { 'IP': '172.17.12.6', 'NAME': '3-7' },
    { 'IP': '172.17.12.7', 'NAME': '3-8' },
    { 'IP': '172.17.12.8', 'NAME': '3-9' }
]

VM_SOCKETS = [ socket.socket()  for i in range(9) ]

for index, s in enumerate(VM_SOCKETS):
    s.bind(VMS[index]['IP'])

try:
    while True:
        c, addr = URB_SOCKET.accept()
        print(addr)
        c.send(b'CONNECTED\n')
        data = c.recv(1024)
        print(data)
        c.close()
except KeyboardInterrupt:
    s.close()

