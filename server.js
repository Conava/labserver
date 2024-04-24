const net = require('net');
const port = 3000;
const host = 'localhost';

let authorized = false; // Flag to store authorization status

const server = net.createServer();
server.listen(port, host, () => {
    console.log(`TCP Server is running on port ${port}.`);
});

server.on('connection', (sock) => {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    sock.on('data', (data) => {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Check the authentication message
        if (data.toString().trim() === 'authString') { // 'authString' is the expected string for successful auth
            authorized = true;
            console.log('Authentication successful.');
            sock.write('Login approved');
        } else {
            sock.write('Login failed');
        }
    });

    sock.on('close', (data) => {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
});