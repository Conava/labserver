// app.js
const express = require('express');
const app = express();
const port = 8000; // Assuming the port for the HTTP server is 8000

app.use(express.json());
app.use(express.static('path_to_your_html_css_js_files')); 

let tcpAuthorized = false;

app.get('/api/check-authorization', (req, res) => {
    if (tcpAuthorized) {
        res.json({ authorized: true });
    } else {
        res.json({ authorized: false });
    }
});

app.listen(port, () => {
    console.log(`HTTP Server running on http://localhost:${port}`);
});