const express = require('express');
const session = require('express-session');
const serveStatic = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const SQLiteStore = require('connect-sqlite3')(session);
const cookieParser = require('cookie-parser');
const app = express();
const https = require('https');
const http = require('http');
const net = require('net');
const fs = require('fs');
const minimist = require('minimist');

const sslOptions = {
    key: fs.readFileSync('certificates/key.pem'),
    cert: fs.readFileSync('certificates/cert.pem')
};

// Serve static files from the Vue app
app.use('/', serveStatic(path.join(__dirname, '../client/dist'), {
    index: ['index.html', 'subdirectory/index.html'],
}));

app.use(bodyParser.json());

app.use(cookieParser());

passport.serializeUser(function (user, done) {
    return done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    db.get('SELECT id, username FROM users WHERE id = ?', id, function (err, row) {
        if (!row) return done(null, false);
        return done(null, row);
    });
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        db.get('SELECT password FROM users WHERE username = ?', username, function (err, row) {
            if (!row) return done(null, false);
            bcrypt.compare(password, row.password, function (err, res) {
                if (!res) return done(null, false);
                db.get('SELECT id, username FROM users WHERE username = ?', username, function (err, row) {
                    return done(null, row);
                });
            });
        });
    }
));

app.use(session({
    store: new SQLiteStore,
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, //todo: set to true in production
        httpOnly: true,
        sameSite: true,
        maxAge: 60000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.post('/login', function (req, res) {
    const {username, password} = req.body;

    db.get('SELECT password FROM users WHERE username = ?', username, function (err, row) {
        if (!row) {
            return res.status(401).json({success: false, message: 'Invalid username or password'});
        }

        bcrypt.compare(password, row.password, function (err, result) {
            if (result) {
                req.session.isLoggedIn = true;
                return res.json({success: true});
            } else {
                return res.status(401).json({success: false, message: 'Invalid username or password'});
            }
        });
    });
});

app.post('/authenticate', function (req, res) {
    console.log("Authenticating...");
    // todo: replace with actual port and IP in production
    let coralPort = 44000;
    let coralIP;
    if (env === 'dev') {
        coralIP = 'localhost';
    } else {
        coralIP = '192.168.4.10';
    }
    let rejectedAnswer = '2';
    let expectedAnswer3 = '1';
    // Create a random connection id
    const connectionId = Math.floor(Math.random() * 900) + 100; //3 digit number

    const coral = net.createConnection({port: coralPort, host: coralIP}, () => {
        // Send connectionId to other device
        //todo: uncomment and sync with coral
        coral.write(connectionId.toString());
        console.log("ConnectionId sent to coral: " + connectionId.toString());
    });


    coral.on('data', (data) => {
        // Receive answer and evaluate it
        const answer = data.toString();
        if (answer === expectedAnswer3) {
            console.log('Access granted');
            req.session.isAuthenticated = true;
            res.json({success: true});
        } else if (answer === rejectedAnswer) {
            res.status(401).json({success: false, message: 'Access denied'});
            console.log('Access denied');
        }
        coral.end();
    });

    coral.on('error', (err) => {
        console.log('An error occurred on the server');
        console.error(err);
        res.status(500).json({success: false, message: 'An error occurred on the server'});
    });

    coral.on('close', () => {
        console.log('The socket connection was closed unexpectedly');
        if (!res.headersSent) {
            res.status(500).json({success: false, message: 'The socket connection was closed unexpectedly'});
        }
    });

    // Set a timeout of one minute to receive the answer
    setTimeout(() => {
        if (!req.session.isAuthenticated) {
            console.log('Authentication timed out');
            coral.end();
            if (!res.headersSent) {
                res.json({error: 'Authentication timed out'});
            }
        }
    }, 60000);
});

function ensureAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.status(401).json({success: false, message: 'You are not authenticated'});
    }
}

app.get('/protected', ensureAuthenticated, function (req, res) {
    // This route is only accessible to authenticated users
    res.json({success: true, message: 'You are viewing a protected route'});
});

app.post('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) {
            // Handle error
            console.error(err);
            return res.json({success: false});
        }
        // If logout was successful, set the session variables to false
        req.session.isLoggedIn = false;
        req.session.isAuthenticated = false;
        res.json({success: true});
    });
});

app.get('/', (req, res) => {
    if (!req.session.views) {
        req.session.views = 1;
    } else {
        req.session.views++;
    }
    res.end(`Number of views: ${req.session.views}`);
});

// Initialize the database
let db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users database.');
});

// Create the users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users
        (
            id
                INTEGER
                PRIMARY
                    KEY
                AUTOINCREMENT,
            username
                TEXT
                NOT
                    NULL
                UNIQUE,
            password
                TEXT
                NOT
                    NULL
        )`, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Users table created or already exists.');
});

function addUser(username, password) {
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            return console.error(err);
        }
        db.run(`INSERT INTO users(username, password)
                VALUES (?, ?)`, [username, hash], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User added with ID: ${this.lastID}`);
        });
    });
}

// todo: remove this in production. Uncomment if users.db not present

addUser('admin', 'nimda');
addUser('Marlon', 'nimda');
addUser('Silas', 'nimda');
addUser('Oskar', 'nimda');
addUser('Laurin', 'nimda');
addUser('Ludwig', 'nimda');


/*
Starts the server.
Optional command-line arguments: -e, --env, -p, --port
-e, --env: Specifies the environment (dev or prod)
-p, --port: Specifies the port number

Example usage: node server.js -e dev -p 3000
This will start the server in development mode on port 3000.
 */
// Parse command-line arguments
// Parse command-line arguments
const args = minimist(process.argv.slice(2), {
    alias: {
        e: 'env',
        p: 'port'
    }
});

let env = args.env;
let port = args.port;

if (!args.e && !args.p) {
    env = 'prod';
    port = '443';
}

// If only a port is specified, use that and set env to prod
if (!args.e && args.p) {
    env = 'prod';
}

// If the environment is 'dev', set the default port to 3000 if not specified
if (args.e && !args.p) {
    if (env === 'dev') {
        port = 3000;
    } else {
        port = 443;
    }
}

let server;

if (env === 'dev') {
    server = http.createServer(app);
    console.log('Server running in development mode on HTTP');
} else {
    server = https.createServer(sslOptions, app);
    console.log('Server running in production mode on HTTPS');
}

server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
});