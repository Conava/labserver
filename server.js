const net = require('net');
const port = 3000;
const host = 'localhost';

const server = net.createServer();
server.listen(port, host, () => {
    console.log(`TCP Server is running on port ${port}.`);
});

let authorized = false;

server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    
    sock.on('data', function(data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Check the authentication message
        if (data.toString().trim() == 'exampleValue') {
            authorized = true;
            console.log('Authentication successful.');
            sock.write('Login approved');
        } else {
            sock.write('Login failed');
        }
    });

    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
});