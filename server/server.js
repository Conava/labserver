const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
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

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Authenticate the user
  // This is just a simple example, in a real application you should use a more secure way to authenticate users
  if (username === 'admin' && password === 'password') {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});