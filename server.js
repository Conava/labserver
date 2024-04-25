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

app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('login');
});
app.get('/login', function(req, res){
  res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('users.json'));
        const user = data.users.find(user => user.name === req.body.username);
        if (user == null) {
          return res.render('alert', { message: 'Username or password is incorrect' });
        }
        if (await bcrypt.compare(req.body.password, user.password)) {
            req.session.user = user;
            req.session.username = req.body.username;
            req.session.loggedin = true; // Set loggedin to true
            return res.redirect('/dashboard');
        } else {
          return res.render('alert', { message: 'Username or password is incorrect'});
        }
    } catch {
        res.status(500).send();
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
      { name: 'admin', password: 'nimda'},
      { name: 'user1', password: 'password1' },
      { name: 'user2', password: 'password2' },
      { name: 'user3', password: 'password3' },
      { name: 'user4', password: 'password4' },
      { name: 'user5', password: 'password5' },
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});