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
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

// Serve static files from the Vue app
app.use('/', serveStatic(path.join(__dirname, '../client/dist'), {
    index: ['index.html', 'subdirectory/index.html'],
    setHeaders: function (res, path) {
        res.setHeader('Access-Control-Allow-Origin', '*')
    }
}));

app.use(bodyParser.json());

app.use(cookieParser());

passport.serializeUser(function(user, done) {
    return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
        if (!row) return done(null, false);
        return done(null, row);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        db.get('SELECT password FROM users WHERE username = ?', username, function(err, row) {
            if (!row) return done(null, false);
            bcrypt.compare(password, row.password, function(err, res) {
                if (!res) return done(null, false);
                db.get('SELECT id, username FROM users WHERE username = ?', username, function(err, row) {
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

app.post('/login', passport.authenticate('local'), function(req, res) {
    // Create JWT
    const token = jwt.sign({ id: req.user.id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Store JWT in a cookie
    res.cookie('jwt', token, { httpOnly: true, sameSite: true });

    res.json({success: true});
});

// Middleware to protect routes
function authenticateJWT(req, res, next) {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'your_jwt_secret', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

app.get('/protected', authenticateJWT, (req, res) => {
    // If this point is reached, the user is authenticated
    res.json({message: 'This is a protected route'});
});

app.get('/logout', function(req, res){
  req.logout();
  res.json({success: true});
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

// todo: remove this in production
/*
addUser('admin', 'nimda');
addUser('Marlon', 'nimda');
addUser('Silas', 'nimda');
addUser('Oskar', 'nimda');
addUser('Laurin', 'nimda');
addUser('Ludwig', 'nimda');
*/

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});