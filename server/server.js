// Importing required modules
const express = require('express');
const session = require('express-session');
const serveStatic = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const SQLiteStore = require('connect-sqlite3')(session);
const cookieParser = require('cookie-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const minimist = require('minimist');
const axios = require('axios');

let db, env;

// SSL options for HTTPS
const sslOptions = {
    key: fs.readFileSync('certificates/key.pem'),
    cert: fs.readFileSync('certificates/cert.pem')
};

// Initialize express app
const app = express();

// Check if users.db exists
fs.access(path.join(__dirname, 'users.db'), fs.constants.F_OK, (err) => {
    // If users.db does not exist, initialize the database and add users
    if (err) {
        console.log('users.db does not exist. Initializing database and adding users...');
        const initializeDatabase = require('./initializeDatabase.js');
        initializeDatabase();
    }
    // Open a database connection and assign it to the db variable
    db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the users database.');
        }
    });
});

// Function to set up middleware
function setupMiddleware() {

    app.use(bodyParser.json());
    app.use(cookieParser());

    // Serve static files from the Vue app
    app.use('/', serveStatic(path.join(__dirname, '../client/dist'), {
        index: ['index.html', 'subdirectory/index.html'],
    }));

    // Setup body parser and cookie parser
    app.use(bodyParser.json());
    app.use(cookieParser());

    // Setup session
    app.use(session({
        store: new SQLiteStore,
        secret: 'coral-reef',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            httpOnly: true,
            sameSite: true,
            maxAge: 5 * 60 * 1000 // 5 minutes
        }
    }));

    // Initialize passport
    app.use(passport.initialize());
    app.use(passport.session());
}

// Function to set up passport strategies
function setupPassport() {
    passport.serializeUser(function (user, done) {
        return done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        db.get('SELECT id, username FROM users WHERE id = ?', id, function (err, row) {
            if (err) {
                return done(err);
            }
            if (!row) {
                return done(new Error('User not found'));
            }
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
}

// Function to set up routes
function setupRoutes() {
    // Check for currently active session
    app.get('/checkAuthentication', function (req, res) {
        if (req.session.isAuthenticated) {
            res.status(200).json({isAuthenticated: true});
        } else {
            res.status(200).json({isAuthenticated: false});
        }
    });

    // Login route
    app.post('/login', function (req, res) {
        const {username, password} = req.body;

        db.get('SELECT id, password FROM users WHERE username = ?', username, function (err, row) {
            if (!row) {
                return res.status(401).json({success: false, message: 'Invalid username or password'});
            }

            bcrypt.compare(password, row.password, function (err, result) {
                if (result) {
                    req.session.isLoggedIn = true;
                    req.session.passport = {user: row.id}; // Set req.session.passport.user to the logged-in user's ID
                    console.log('req.session.passport.user set:', req.session.passport.user);
                    return res.json({success: true});
                } else {
                    return res.status(401).json({success: false, message: 'Invalid username or password'});
                }
            });
        });
    });

// Logout route
    app.post('/logout', function (req, res) {
        req.logout(function (err) {
            if (err) {
                // Handle error
                console.error(err);
                return res.json({success: false});
            }
            req.session.destroy(function (err) {
                if (err) {
                    // Handle error
                    console.error(err);
                    return res.json({success: false});
                }
                res.json({success: true});
            });
        });
    });

    // Protected content delivery for Homepage
    app.get('/cards', (req, res) => {
        console.log('GET /cards');
        // Check for authentication
        if (!req.session.isAuthenticated) {
            return res.status(401).json({message: 'Not authenticated.'});
        }

        let imageData;
        try {
            const response = axios({
                method: 'get',
                url: 'http://192.168.4.10/camera_stream',
                responseType: 'arraybuffer'
            });
            // Convert the image data to a Base64 string
            imageData = Buffer.from(response.data, 'binary').toString('base64');
        } catch (error) {
            console.error('Error fetching image:', error);
        }

        // Send 3 example cards
        res.json([
            {
                id: 1,
                elements: [
                    {type: 'text', content: 'Authentication Image from the coral:'},
                    {type: 'image', content: 'data:image/jpeg;base64,${imageData}'},
                ],
            },
            {
                id: 2,
                elements: [
                    {type: 'text', content: 'This is card 2.'},
                    {type: 'button', content: {text: 'Click me', action: '/path/to/action'}},
                ],
            },
            {
                id: 3,
                elements: [
                    {type: 'title', content: 'Laboratory Source Code'},
                    {type: 'text', content: 'Webserver Source Code: '},
                    {
                        type: 'button',
                        content: {
                            text: 'Go to GitLab',
                            action: 'https://git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/webserver'
                        }
                    },
                    {type: 'text', content: ' '},
                    {type: 'text', content: 'Coral Source Code: '},
                    {
                        type: 'button',
                        content: {
                            text: 'Go to GitLab',
                            action: 'https://git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/coral-test'
                        }
                    },
                    {type: 'text', content: ' '},
                    {type: 'text', content: 'Handmodell Source Code: '},
                    {
                        type: 'button',
                        content: {
                            text: 'Go to GitLab',
                            action: 'https://git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/handmodell'
                        }
                    },
                ],
            },
        ]);
    });

    //Coral authentication route
    app.post('/authenticate', function (req, res) {
        console.log("Authenticating...");
        let coralIP;
        if (env === 'dev') {
            coralIP = 'localhost'; //use local Python coral emulator for testing
        } else {
            coralIP = '192.168.4.10';
        }

        // Create a random connectionId 3-digit number
        const connectionId = Math.floor(Math.random() * 900) + 100;
        console.log("Sent connectionId: ", connectionId); // Print the connectionId that you're sending


        // Send GET request to the coral's HTTP server
        axios.get(`http://${coralIP}/connectionId${connectionId}`)
            .then(response => {
                console.log("Received response: ", response.data); // Print the entire received response

                // Change response.date.connectionId to a number
                response.data.connectionId = parseInt(response.data.connectionId);

                // Check if the connectionId in the response matches the one we sent
                if (response.data.connectionId !== connectionId) {
                    console.log('ConnectionId mismatch');
                    return res.status(401).json({success: false, message: 'ConnectionId mismatch'});
                }

                // Check the status in the response
                if (response.data.status === 0) {
                    console.log('Coral error');
                    return res.status(500).json({success: false, message: 'Coral error'});
                } else if (response.data.status === 2) {
                    console.log('Access denied');
                    return res.status(401).json({success: false, message: 'Access denied'});
                }

                console.log('req.session.passport.user:', req.session.passport.user);

                // Check the passphrase in the response
                db.get('SELECT objectPassphrase FROM users WHERE id = ?', req.session.passport.user, function (err, row) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({success: false, message: 'Database error'});
                    }

                    if (!row) {
                        console.log('User not found');
                        return res.status(401).json({success: false, message: 'User not found'});
                    }

                    // If the logged-in user is 'admin', grant access without checking the passphrase
                    if (row.username === 'admin') {
                        console.log('Access granted to admin');
                        req.session.isAuthenticated = true;
                        return res.json({success: true});
                    }

                    console.log('Passphrase:', response.data.passphrase);
                    console.log('Object passphrase:', row.objectPassphrase);

                    bcrypt.compare(response.data.passphrase, row.objectPassphrase, function (err, result) {
                        if (err) {
                            console.error('Error matching object, access denied', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Error matching object, access denied'
                            });
                        }

                        if (!result) {
                            console.log('Object mismatch, access denied');
                            return res.status(401).json({success: false, message: 'Object mismatch, access denied'});
                        }

                        // If everything checks out, the user is authenticated
                        console.log('Access granted');
                        req.session.isAuthenticated = true;
                        res.json({success: true});
                    });
                });
            })
            .catch(error => {
                console.error('Error connecting to coral:', error);
                if (error.code === 'EHOSTUNREACH') {
                    res.status(500).json({
                        success: false,
                        message: 'Cannot reach the coral server. Please check the server address and try again.'
                    });
                } else {
                    res.status(500).json({success: false, message: 'Error connecting to coral'});
                }
            });

        // Set a timeout of one minute to receive the answer
        setTimeout(() => {
            if (!req.session.isAuthenticated) {
                console.log('Authentication timed out');
                if (!res.headersSent) {
                    res.json({error: 'Authentication timed out'});
                }
            }
        }, 60000);
    });

    // Home route
    app.get('/', (req, res) => {
        if (!req.session.views) {
            req.session.views = 1;
        } else {
            req.session.views++;
        }
        res.end(`Number of views: ${req.session.views}`);
    });
}


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
function startServer() {
    // Parse command-line arguments
    const args = minimist(process.argv.slice(2), {
        alias: {
            e: 'env',
            p: 'port'
        }
    });

    env = args.env;
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
}

// Call the functions to set up the server
setupMiddleware();
setupPassport();
setupRoutes();
startServer();