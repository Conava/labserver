const express = require('express');
const session = require('express-session');
const serveStatic = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true, // Ensures the browser only sends the cookie over HTTPS.
        httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client JavaScript, helping to protect against cross-site scripting attacks.
        sameSite: true, // Ensures the cookie is only sent for same-site requests, helping to protect against cross-site request forgery attacks.
        maxAge: 60000 // Sets the maximum age of the cookie (e.g., 1 minute in this case).
    }
}));

// Serve static files from the Vue app
app.use('/', serveStatic(path.join(__dirname, '../client/dist'), {
    index: ['index.html', 'subdirectory/index.html'],
    setHeaders: function (res, path) {
        res.setHeader('Access-Control-Allow-Origin', '*')
    }
}));

app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const {username, password} = req.body;

    // Authenticate the user
    // This is just a simple example, in a real application you should use a more secure way to authenticate users
    if (username === 'admin' && password === 'password') {
        res.json({success: true});
    } else {
        res.json({success: false});
    }
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

// DELETE ON PRODUCTION
addUser('admin', 'nimda');
addUser('Marlon', 'nimda');
addUser('Silas', 'nimda');
addUser('Oskar', 'nimda');
addUser('Laurin', 'nimda');
addUser('Ludwig', 'nimda');

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});