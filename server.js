const express = require('express');
const session = require('express-session');
const app = express();
const bcrypt = require('bcrypt');
const fs = require('fs');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Home Page');
});

app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('login');
});

app.post('/register', async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = { name: req.body.name, password: hashedPassword };
      const data = JSON.parse(fs.readFileSync('users.json'));
      data.users.push(user);
      fs.writeFileSync('users.json', JSON.stringify(data));
      res.status(201).send();
    } catch {
      res.status(500).send();
    }
  });

  app.post('/login', (req, res) => {
    const data = JSON.parse(fs.readFileSync('users.json'));
    const user = data.users.find(user => user.name === req.body.name);
    if (user == null) {
      return res.status(400).send('Cannot find user');
    }
    try {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send('Success');
      } else {
        res.send('Not Allowed');
      }
    } catch {
      res.status(500).send();
    }
  });

app.get('/dashboard', function(request, response) {
    if (request.session.loggedin) {
        response.render('dashboard', {username: request.session.username});
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

app.listen(3000);