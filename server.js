require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: process.env.DB_PASSWORD, // Use environment variable for password
    database: 'professors_record'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        throw err;
    }
    console.log('Connected to database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (HTML, CSS, JS)
app.use(cors()); // Enable CORS for all routes

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the results page
app.get('/results.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

// Handle form submission
app.post('/submit', (req, res) => {
    const { teacherName, subject, school, campus, date, inTime, phoneNumber } = req.body;
    const query = 'INSERT INTO records (teacher_name, subject, school, campus, record_date, in_time, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [teacherName, subject, school, campus, date, inTime, phoneNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        res.send('Record added successfully');
    });
});

// Retrieve information based on date and password
app.get('/retrieve', (req, res) => {
    const { date, password } = req.query;

    // Check if the password is correct
    if (password !== 'SDSU123') { // Replace with your actual password
        return res.status(401).send('Unauthorized');
    }

    // Query the database for records on the given date
    const query = 'SELECT * FROM records WHERE record_date = ?';

    db.query(query, [date], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.send('No records found for the given date');
        }

        // Send the results as JSON
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
