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
require('dotenv').config();

const initializeDatabase = require('./initializeDatabase.js');

// Initialize express app
const app = express();

let env, db;

// SSL options for HTTPS
const sslOptions = {
    key: fs.readFileSync('certificates/key.pem'),
    cert: fs.readFileSync('certificates/cert.pem')
};

/**
 * Sets up the database connection.
 * This function attempts to connect to an existing 'users.db' database.
 * If the database does not exist, it initializes a new database and populates it with predefined users.
 *
 * @async
 * @function setupDatabase
 * @returns {Promise<void>} A promise that resolves when the database is set up.
 */
async function setupDatabase() {
    try {
        await fs.promises.access(path.join(__dirname, 'users.db'), fs.constants.F_OK);
        db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE);
        console.log('Connected to existing users database.');
    } catch (err) {
        console.log('users.db does not exist. Initializing database and adding users...');
        initializeDatabase();
        db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE);
        console.log('Connected to new users database.');
    }
}

/**
 * Configures middleware for the Express application.
 *
 * This function sets up various middleware necessary for the application's operation, including:
 * - Body parsing for JSON payloads, allowing easy access to request body data.
 * - Cookie parsing for handling cookies in requests.
 * - Static file serving from the specified directory, enabling the serving of client-side assets.
 * - Session management using SQLite store, configuring session cookies and their properties.
 * - Passport initialization for authentication, setting up session support for persistent login sessions.
 */
function setupMiddleware() {
    // Parse JSON bodies (as sent by API clients)
    app.use(bodyParser.json());

    // Parse cookies (used for authentication)
    app.use(cookieParser());

    // Serve static files from the specified directory
    app.use('/', serveStatic(path.join(__dirname, '../client/dist')));

    // Configure session management with options
    app.use(session({
        store: new SQLiteStore(), // Use SQLite as the session store
        secret: process.env.SESSION_SECRET || 'default_secret', // Secret used to sign the session ID cookie
        resave: false, // Do not force session to be saved back to the session store
        saveUninitialized: true, // Save uninitialized sessions to the store
        cookie: {
            secure: env === 'prod', // Use secure cookies in production environment
            httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
            sameSite: true, // Strictly use same site policy for cookies
            maxAge: 5 * 60 * 1000 // Set cookie expiration time to 5 minutes
        }
    }));

    // Initialize Passport and restore authentication state, if any, from the session
    app.use(passport.initialize());
    app.use(passport.session());
}

/**
 * Configures Passport for user authentication.
 *
 * This function sets up the Passport authentication strategy using a local strategy.
 * It involves serializing and deserializing user information for session management
 * and defining the authentication process with username and password.
 *
 * - `serializeUser` is used to determine which data of the user object should be stored in the session.
 *   Here, the user's ID is stored.
 *
 * - `deserializeUser` is used to retrieve the user data from the database based on the ID stored in the session.
 *   This is essential for fetching user details on subsequent requests after login.
 *
 * - The `LocalStrategy` defines the actual authentication process, checking the username and password against
 *   the database. It uses bcrypt to compare the provided password with the hashed password stored in the database.
 *   If the authentication is successful, the user object is returned for session management.
 */
function setupPassport() {
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        db.get('SELECT id, username FROM users WHERE id = ?', id, (err, row) => {
            if (err) return done(err);
            done(null, row);
        });
    });
    passport.use(new LocalStrategy((username, password, done) => {
        db.get('SELECT password FROM users WHERE username = ?', username, async (err, row) => {
            if (!row) return done(null, false);
            const match = await bcrypt.compare(password, row.password);
            if (!match) return done(null, false);
            db.get('SELECT id, username FROM users WHERE username = ?', username, (err, row) => done(null, row));
        });
    }));
}


/**
 * Sets up the routes for the Express application.
 *
 * This function defines the endpoints for checking authentication status, logging in, logging out,
 * delivering the dashboard content, and authenticating with an external device (Coral).
 * Each route is designed to handle specific types of requests and respond accordingly based on the
 * application's current state and the provided request data.
 */
function setupRoutes() {
    /**
     * GET endpoint to check if the user is currently authenticated.
     * Responds with JSON indicating the authentication status.
     */
    app.get('/checkAuthentication', function (req, res) {
        if (req.session.isAuthenticated) {
            res.status(200).json({isAuthenticated: true});
        } else {
            res.status(200).json({isAuthenticated: false});
        }
    });

    /**
     * POST endpoint for user login.
     * Expects username and password in the request body. Validates the credentials against the database.
     * If successful, updates the session to reflect the user's logged-in status.
     */
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

    /**
     * POST endpoint for user logout.
     * Logs the user out by clearing the session and destroying it.
     */
    app.post('/logout', function (req, res) {
        req.logout(function (err) {
            if (err) {
                console.error(err);
                return res.json({success: false});
            }
            req.session.destroy(function (err) {
                if (err) {
                    console.error(err);
                    return res.json({success: false});
                }
                res.json({success: true});
            });
        });
    });

    /**
     * GET endpoint to deliver the dashboard content.
     * Checks if the user is authenticated before sending sensitive information.
     * This example sends a list of cards with various elements.
     */
    app.get('/cards', (req, res) => {
        if (!req.session.isAuthenticated) {
            return res.status(401).json({message: 'Not authenticated.'});
        }

        // todo: replace dummy data with method to generate the cards dynamically based on user data in the database
        res.json([
            {
                id: 1,
                elements: [
                    {type: 'title', content: 'Image Demonstration'},
                    {type: 'image', content: 'favicon.ico'},
                    {type: 'text', content: 'Favicon for our webserver generated with Adobe Firefly AI'},
                ],
            },
            {
                id: 2,
                elements: [
                    {
                        type: 'title',
                        content: 'Welcome in the Laboratory Dashboard!'
                    },
                    {
                        type: 'text',
                        content: "Here you can find all the information you need for running the Server yourself."
                    },
                    {
                        type: 'button',
                        content: {
                            text: 'Download README',
                            action: '/download/readme'
                        }
                    }
                ]
            },
            {
                id: 3,
                elements: [
                    {type: 'title', content: 'Laboratory Source Code'},
                    {type: 'text', content: 'Webserver Source Code: '},
                    {
                        type: 'link',
                        content: {
                            text: 'Go to GitLab',
                            url: 'https://git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/webserver'
                        }
                    },
                    {type: 'text', content: ' '},
                    {type: 'text', content: 'Coral Source Code: '},
                    {
                        type: 'link',
                        content: {
                            text: 'Go to GitLab',
                            url: 'https://git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/coral-test'
                        }
                    },
                    {type: 'text', content: ' '},
                    {type: 'text', content: 'Handmodell Source Code: '},
                    {
                        type: 'link',
                        content: {
                            text: 'Go to GitLab',
                            url: 'https://git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/handmodell'
                        }
                    },
                ],
            },
        ]);
    });

    /**
     * Endpoint to download the README file.
     * This GET endpoint serves the README.md file located in the server directory to the client,
     * prompting a file download in the browser.
     */
    app.get('/download/readme', function (req, res) {
        const readmePath = path.join(__dirname, '../README.md');
        res.download(readmePath); // This will prompt the user to download the README.md file
    });

    /**
     * POST endpoint for external device (Coral) authentication.
     * Sends a unique connection ID to the Coral device and expects a matching ID in response
     * to start the authentication process. If successful, the user is authenticated.Skipped of user 'admin'
     */
    app.post('/authenticate', function (req, res) {
        console.log("Authenticating...");

        // If the logged-in user is admin, skip authentication
        if (req.user.username === 'admin') {
            console.log('User is admin, skipping authentication');
            req.session.isAuthenticated = true;
            return res.json({success: true});
        }
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
                console.log("Received response: ", response.data); // Print the entire received response for debugging purposes

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
                db.get('SELECT username, objectPassphrase FROM users WHERE id = ?', req.session.passport.user, function (err, row) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({success: false, message: 'Database error'});
                    }

                    if (!row) {
                        console.log('User not found');
                        return res.status(401).json({success: false, message: 'User not found'});
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
                            return res.status(401).json({
                                success: false,
                                message: 'Object mismatch, access denied'
                            });
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
}

/**
 * Starts the server with configurations based on command-line arguments.
 * This asynchronous function performs several key startup tasks:
 * - Parses command-line arguments to determine the server's running environment (development or production)
 *   and the port number on which the server should listen.
 * - Initializes the database by checking for its existence and creating it if necessary, along with setting up initial data.
 * - Sets up middleware for the Express application, including body parsing, cookie parsing, static file serving, and session management.
 * - Configures Passport for user authentication, defining how users are serialized and deserialized during the session and setting up the local authentication strategy.
 * - Defines the routes for the application, including endpoints for authentication, content delivery, and external device integration.
 * - Depending on the environment, creates either an HTTP or HTTPS server and starts listening on the specified port.
 *
 * Command-line arguments:
 * - `-e` or `--env`: Specifies the environment (`dev` for development or `prod` for production). Defaults to `prod` if not specified.
 * - `-p` or `--port`: Specifies the port number on which the server should listen. Defaults to `3000` if not specified.
 *
 * Example usage:
 * `node server.js -e dev -p 3000` starts the server in development mode on port 3000.
 */
async function startServer() {

    // Parse command-line arguments for environment and port
    const args = minimist(process.argv.slice(2), {alias: {e: 'env', p: 'port'}});

    // Set environment and port from command-line arguments or use defaults
    env = args.env || 'prod'; // Default to 'dev' if not specified
    const port = args.port || 3000; // Default to port 3000 if not specified

    console.log(`Attempting to start server with environment: ${env}, port: ${port}`);

    try {
        if (env === 'prod') {
            // Check SSL certificate files
            await fs.promises.access('certificates/key.pem', fs.constants.F_OK);
            await fs.promises.access('certificates/cert.pem', fs.constants.F_OK);
            console.log('SSL certificate files found.');
        }
    } catch (err) {
        console.error('Error accessing SSL certificate files:', err);
        return; // Stop execution if SSL files are missing
    }

    try {
        await setupDatabase();
        setupMiddleware();
        setupPassport();
        setupRoutes();

        const server = env === 'dev' ? http.createServer(app) : https.createServer(sslOptions, app);

        server.listen(port, () => console.log(`Server listening on port ${port} in ${env} mode`));

        if (env === 'prod') {
            // Redirect HTTP to HTTPS
            http.createServer((req, res) => {
                res.writeHead(301, {Location: `https://${req.headers.host}${req.url}`});
                res.end();
            }).listen(80);
        }
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer().catch(console.error);