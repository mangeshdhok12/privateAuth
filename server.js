
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Middleware for token verification
// const auth = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) return res.status(403).json({ error: 'No token provided' });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) return res.status(401).json({ error: 'Unauthorized' });
//         req.userId = decoded.id;
//         next();
//     });
// };

// // Public route
// app.get('/api/public', (req, res) => {
//     res.json({ message: 'This is a public route' });
// });

// // Private route
// app.get('/api/private', auth, (req, res) => {
//     res.json({ message: 'This is a private route', userId: req.userId });
// });

// // Endpoint to generate a token (for testing purposes)
// app.post('/api/generate-token', (req, res) => {
//     const userId = req.body.userId; // Simulating user ID from request
//     const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the User model

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware for token verification
const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

// Public route
app.get('/api/public', (req, res) => {
    res.json({ message: 'This is a public route' });
});

// Private route
app.get('/api/private', auth, (req, res) => {
    res.json({ message: 'This is a private route', userId: req.userId });
});

// Endpoint to generate a token and store userId in MongoDB
app.post('/api/generate-token', async (req, res) => {
    const { userId } = req.body; // Get userId from request
    
    try {
        // Save the userId to MongoDB
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId });
            await user.save();
        }
        
        const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error saving user to database' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
