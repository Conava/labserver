const express = require('express');
const session = require('express-session');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = express();
const bcrypt = require('bcrypt');
const port = process.argv[2] || 443;

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

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.json());

app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('login');
});
app.get('/login', function(req, res){
  res.render('login');
});

app.post('/login', async function(req, res) {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json')).users;
    const user = users.find(user => user.name === username);
    if (user && await bcrypt.compare(password, user.password)) {
        // If the credentials are correct, start a session and redirect to the dashboard
        req.session.userId = user.id;
        req.session.loggedin = true; // set session.loggedin to true
        req.session.username = username; // store the username in the session

        res.redirect('/dashboard');
    } else {
        // If the credentials are incorrect, send a response with status 401 (Unauthorized)
        res.status(401).send('Incorrect credentials');
    }
});

app.get('/dashboard', function(request, response) {
    if (request.session.loggedin) {
        response.render('dashboard', {username: request.session.username});
    } else {
        response.redirect('/error');
    }
    response.end();
});

app.get('/error', function(req, res){
  res.render('error');
});

// Create users.json file with hashed passwords.
// Relocate to real database in production.
async function createUsers() {
  const users = [
      { name: 'Admin', password: 'nimdA'},
      { name: 'Marlon', password: 'nimdA' },
      { name: 'Silas', password: 'nimdA' },
      { name: 'Laurin', password: 'nimdA' },
      { name: 'Oskar', password: 'nimdA' },
      { name: 'Ludwig', password: 'nimdA' },
  ];

  const hashedUsers = await Promise.all(users.map(async user => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return { name: user.name, password: hashedPassword };
  }));

  fs.writeFileSync('users.json', JSON.stringify({ users: hashedUsers }));
}
createUsers();
//End of createUsers

app.get('/logout', function(req, res){
  req.session.destroy(function(err) {
      if(err) {
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