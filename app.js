const express = require('express');
const app = express();
const port = 8000; // different from TCP server

let authorized = false; // This can be updated based on TCP server logic or via direct interaction

app.get('/api/check-authorization', (req, res) => {
    // Somehow interact with TCP server or use a shared status variable/resource
    res.json({ authorized });
});

app.listen(port, () => console.log(`HTTP server running on port ${port}`));