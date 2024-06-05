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

app.post('/login', function(req, res) {
  const { username, password } = req.body;

  db.get('SELECT password FROM users WHERE username = ?', username, function(err, row) {
    if (!row) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    bcrypt.compare(password, row.password, function(err, result) {
      if (result) {
        req.session.isLoggedIn = true;
        return res.json({ success: true });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    });
  });
});

app.post('/authenticate', function(req, res) {
  // Implement your authentication logic here
  // If the authentication is successful, set a session cookie
  req.session.isAuthenticated = true;
  res.json({ success: true });
});

function ensureAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'You are not authenticated' });
  }
}

app.get('/protected', ensureAuthenticated, function(req, res) {
  // This route is only accessible to authenticated users
  res.json({ success: true, message: 'You are viewing a protected route' });
});

app.post('/logout', function(req, res){
  req.logout(function(err) {
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