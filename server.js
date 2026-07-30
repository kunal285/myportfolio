const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 1000;

// Serve static files from the current directory
app.use(express.static(__dirname));



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
