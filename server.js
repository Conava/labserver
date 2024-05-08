const express = require('express');
const session = require('express-session');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = express();
const bcrypt = require('bcrypt');
const port = process.argv[2] || 443;
const net = require('net');

/* TCP Server test
const tcpServer = net.createServer((socket) => {
    //Test command:
    // echo -e '#!/bin/bash\nserver_address="localhost"\nport=3000\nmessage="Hello, Server!"\necho "$message" | nc $server_address $port' | bash
    socket.on('data', (data) => {
        console.log(`Received data: ${data}`);
    });
});

tcpServer.listen(3000, () => {
    console.log('TCP server is running on port 3000');
});
*/

let server;

try {
    // Try to read the SSL certificate and private key
    const options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem'),
        passphrase: 'laboratory' // Replace with the passphrase you used when generating the private key
    };

    // Create an HTTPS server.sh
    server = https.createServer(options, app);

    // Create an HTTP server
    http.createServer(function (req, res) {
        // Set the response header to a 301 redirect (Moved Permanently)
        res.writeHead(301, {"Location": "https://" + req.headers['host'] + req.url});
        res.end();
    }).listen(80);
} catch (error) {
    // If an error occurs, print a warning and fall back to the HTTP server.sh
    console.warn('Warning: SSL certificate not found. Falling back to the HTTP server.sh.');
    server = http.createServer(app);
}


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('login');
});
app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', async function (req, res) {
    const {username, password} = req.body;
    const users = JSON.parse(fs.readFileSync('users.json')).users;
    const user = users.find(user => user.name === username);
    if (user && await bcrypt.compare(password, user.password)) {
        // If the credentials are correct, start a session and redirect to the dashboard
        req.session.userId = user.id;
        //req.session.loggedin = true; // set session.loggedin to true
        req.session.awaitAuthentication = true;
        req.session.userName = user.name; // store the username in the session
        res.json({ success: true, message: 'Credentials correct'});
    } else {
        // If the credentials are incorrect, send a response with status 401 (Unauthorized)
        res.status(401).send('Incorrect credentials');
    }
});

// For coral authentication
app.get('/auth', function (req, res) {
    // Create a new TCP server
    const tcpServer = net.createServer((socket) => {
        const timeout = setTimeout(() => {
            console.log('No data received for 120 seconds, closing TCP server');
            tcpServer.close(() => {
                console.log('TCP server closed');
            });
        }, 120000); // 120 seconds
        socket.on('data', (data) => {
            // Get the currently logged-in user
            const users = JSON.parse(fs.readFileSync('users.json')).users;
            const user = users.find(user => user.id === req.session.userId);
            console.log(req.session.userId);

            console.log(`Received data: ${data}`);
            console.log(`User's passphrase: ${user ? user.passphrase : 'User not found'}`);
            console.log(`Awaiting authentication: ${req.session.awaitAuthentication}`);
            console.log(`Data matches passphrase: ${data.toString().trim() === user.passphrase}`);

            console.log(req.session.awaitAuthentication && user && data.toString().trim() === user.passphrase);
            // Check if the received data matches the user's passphrase
            if (req.session.awaitAuthentication && user && data.toString().trim() === user.passphrase) {
                // If the data matches, log the user in and redirect to the dashboard
                req.session.loggedin = true;
                tcpServer.close(() => {
                    console.log('TCP server closed');
                });
                res.redirect('/dashboard');
            } else {
                // If the data does not match, send a response with status 401 (Unauthorized)
                console.log('Unauthorized check');
                tcpServer.close(() => {
                    console.log('TCP server closed');
                });
                // res.status(401).send('Unauthorized'); I have no fucking idea why this shit doesnt work and I am tired of it, here is a stupid workaround
                res.render('login', { error: 'Authentication failed. Please try again.' });
            }
        });
    });

    // Listen on port 3000
    tcpServer.listen(3000, () => {
        console.log('TCP server is running on port 3000');
    });
});

app.get('/dashboard', function (request, response) {
    if (request.session.loggedin) {
        response.render('dashboard', {username: request.session.username});
    } else {
        response.redirect('/error');
    }
    response.end();
});

app.get('/error', function (req, res) {
    res.render('error');
});

// Create users.json file with hashed passwords.
// Relocate to real database in production.
async function createUsers() {
    const users = [
        {name: 'Admin', password: 'nimdA', passphrase: 'laboratory'},
        {name: 'Marlon', password: 'nimdA', passphrase: 'secret'},
        {name: 'Silas', password: 'nimdA', passphrase: 'secret'},
        {name: 'Laurin', password: 'nimdA', passphrase: 'secret'},
        {name: 'Oskar', password: 'nimdA', passphrase: 'secret'},
        {name: 'Ludwig', password: 'nimdA', passphrase: 'secret'},
    ];

    const hashedUsers = await Promise.all(users.map(async user => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {id: users.indexOf(user) + 1, name: user.name, password: hashedPassword, passphrase: user.passphrase};
    }));

    fs.writeFileSync('users.json', JSON.stringify({users: hashedUsers}));
}
createUsers();
//End of createUsers

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
        }
    });
});

// Start the server.sh
server.listen(port, () => {
    console.log(`HTTPS server is running on port ${port}`);
});