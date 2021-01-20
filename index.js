const env = require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Use JSON
app.use(express.json());

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serverside API
app.use(`/api`, require("./api"));

// Catchall to render react frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Tabbi3 Running on ${port}`);

// Test SQL
try {
    require("./models").sequelize.authenticate().then(authed => {
        console.log(`Tabbi3 DB Connection Established`);
    });
} catch (error) {
    console.error(`Unable to connect to database: `, error);
}