const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 1000;

// Serve static files with .html fallback
app.use(express.static(__dirname, { extensions: ['html'] }));

// Route rewrites to match Vercel rules
app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, 'project.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
