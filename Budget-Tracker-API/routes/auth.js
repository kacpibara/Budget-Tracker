const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        // Czy uzytkownik istnieje?
        db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
            if (err) return next(err);
            if (row) return res.status(400).json({ error: "Username already exists" });

            // hashowanie hasla
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // insert/zapis do bazy danych
            const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
            db.run(sql, [username, hashedPassword], function(err) {
                if (err) return next(err);
                res.status(201).json({ message: "User registered successfully!" });
            });
        });
    } catch (error) {
        next(error);
    }
});

// Login
router.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // szukanie uzytkownika
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        // porownanie haseł (czysty tekst vs hash z bazy)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // tworzenie tokenu jwt
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            SECRET, 
            { expiresIn: '1h' } // token wygaśnie po godzinie
        );

        res.json({
            message: "Logged in successfully",
            token: token
        });
    });
});

module.exports = router;