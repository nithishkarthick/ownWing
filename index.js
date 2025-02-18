import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (like HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'views')));

// Session configuration
app.use(session({
    secret: 'yourSecretKey', // Change this to a secure string
    resave: false,
    saveUninitialized: true
}));

// Database connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Your DB password
    database: 'blood_donation' // Your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});

// Serve home.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve login.html (for login page)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Serve index.html (main page after login)
app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});
app.get('/donors', (req, res) => {
    db.query('SELECT * FROM donors', (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Error fetching donors' });
        }
        res.json(results);
    });
});;



// POST endpoint for signup
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Basic validation for matching passwords
    if (password !== confirmPassword) {
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    try {
        // Check if email already exists in the database
        const checkQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length > 0) {
                return res.status(400).send({ message: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(query, [name, email, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Error during signup:', err);
                    return res.status(500).send('Internal Server Error');
                }
                // Redirect to login page after successful signup
                res.redirect('/login');
            });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// POST endpoint for login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Query to get user details from the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error during login:', err); // Log the actual error
            return res.status(500).send('Internal Server Error');  // Send 500 response
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

        // Redirect to index page after successful login
        res.status(200).send({ message: 'Login successful' });  // Ensure correct success response
    });
});
app.post('/donor/register', (req, res) => {
    const { name, age, gender, phone, dob, blood_group, location } = req.body;

    console.log(req.body); // Check the request body

    // Validate the data
    if (!name || !age || !gender || !phone || !dob || !blood_group || !location) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        INSERT INTO donors (name, age, gender, phone, dob, blood_group, location)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, age, gender, phone, dob, blood_group, location];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting donor:', err);
            return res.status(500).json({ message: 'Error inserting donor' });
        }

        res.status(200).json({ message: 'Donor registered successfully!' });
    });
});


app.post('/donor/search', (req, res) => {
    const { bloodGroup, location } = req.body;

    // Correct the column name to 'blood_group' as per your database
    const query = `
        SELECT * FROM donors
        WHERE blood_group = ? AND location LIKE ?
    `;
    const values = [bloodGroup, `%${location}%`]; // Use '%' for partial match

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error searching donors:', err);
            return res.status(500).json({ message: 'Error searching donors' });
        }
        res.status(200).json(result); // Send the search results back to the client
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
