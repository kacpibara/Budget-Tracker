const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'budget.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if(err){
        console.error('Error with connection: ', err.message);
    } else {
        console.log('Database connected SQLite (database.js)');

        // obsługa kluczy obcych w SQLite
        db.run('PRAGMA foreign_keys = ON');

        // Tabela users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) console.error('Error creating users table:', err.message);
        });

        // Tabela expenses (z dodanym user_id)
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error('Error creating expenses table:', err.message);
        });
    }
});

module.exports = db;