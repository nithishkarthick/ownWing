// Import necessary modules
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const fs = require('fs');
// Create an Express app
const app = express();
const port = 3000;

// MySQL Database connection
const db = mysql.createConnection({
    host: 'db',
    user: 'root', // replace with your MySQL username
    password: 'root', // replace with your MySQL password
    database: 'blood_donation',
});
const schemaFilePath = './database/schema.sql';
app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // set to true in production if using HTTPS
}));

fs.readFile(schemaFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the schema file:', err);
        return;
    }

    // Execute the SQL commands in the schema file
    db.query(data, (err, result) => {
        if (err) {
            console.error('Error executing SQL:', err);
            return;
        }
        console.log('Database schema created successfully');
    });
});
// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session
app.use(session({
    secret: 'secretkey', // change this to a secret string
    resave: false,
    saveUninitialized: true,
}));

// Serve static files (like your HTML, CSS, JS, etc.)
app.use(express.static('assets'));

// Route to serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/views/signup.html');
});

// Route to handle Signup (POST)
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(query, [name, email, hashedPassword], (err, results) => {
            if (err) {
                console.error('Error during signup:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).send({ message: 'Account created successfully!' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send({ message: 'Error creating account' });
    }
});

// Route to handle Login (POST)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query to get user details from the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        const user = results[0];

        // Compare password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid email or password' });
        }

        // Store user data in session (for login persistence)
        req.session.user = user;

        res.status(200).send({ message: 'Login successful', user });
    });
});

// Route to check if user is logged in
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send({ message: 'You are not logged in' });
    }

    res.status(200).send({ message: 'Welcome to your profile', user: req.session.user });
});

// Set up middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (like your HTML, CSS, JS, etc.)
app.use(express.static('assets'));

// Home Route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
});

// Route to handle Donor Registration (POST)
app.post('/donor/register', (req, res) => {
    const { name, age, gender, phone, dob, bloodGroup, location } = req.body;

    const query = `INSERT INTO donors (name, age, gender, phone, dob, blood_group, location)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, age, gender, phone, dob, bloodGroup, location], (err, results) => {
        if (err) {
            console.error('Error registering donor:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send({ message: 'Donor registered successfully!' });
    });
});

// Route to handle Donor Search (GET)
app.get('/donor/search', (req, res) => {
    const { bloodGroup, location } = req.query;

    const query = `SELECT * FROM donors WHERE blood_group = ? AND location LIKE ?`;

    db.query(query, [bloodGroup, `%${location}%`], (err, results) => {
        if (err) {
            console.error('Error searching for donors:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results); // Return donors as JSON
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
