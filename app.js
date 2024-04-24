const express = require('express');
const app = express();
const port = 8000; // different from TCP server

app.use(express.static('path_to_your_html_css_js_files')); // Serve your static files

app.get('/api/check-authorization', (req, res) => {
    // Your existing logic here
    res.json({ authorized: true });  // Example, adjust according to your logic
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});