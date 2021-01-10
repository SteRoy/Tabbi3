const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, 'frontend/build')));


// Catchall to render react frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Tabbi3 Running on ${port}`);