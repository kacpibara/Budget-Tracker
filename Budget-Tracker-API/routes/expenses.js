const express = require('express');
const router = express.Router();
const validateExpense = require('../middlewares/validateExpense.js');
const verifyToken = require('../middlewares/verifyToken.js'); // NOWE: Importujemy strażnika
const db = require('../db/database.js');

// NOWE: Dodajemy verifyToken do każdego endpointu.
// Teraz req.userId zawiera ID zalogowanego użytkownika!

router.get('/', verifyToken, function(req, res, next) {
    // Pobieramy tylko wydatki zalogowanego użytkownika
    const sql = "SELECT * FROM expenses WHERE user_id = ?";
    db.all(sql, [req.userId], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
})

router.post('/', verifyToken, validateExpense, function(req, res, next) {
    const { type, name, category, amount, date } = req.body;
    // Dodajemy user_id do zapytania SQL
    const sql = `INSERT INTO expenses(user_id, type, name, category, amount, date) VALUES(?, ?, ?, ?, ?, ?)`;
    const params = [req.userId, type, name, category, amount, date];

    db.run(sql, params, function(err) {
        if(err) return next(err);
        const newExpense = { id: this.lastID, user_id: req.userId, type, name, category, amount, date };

        res.status(201).json({
            message: "Transaction added successfully!",
            data: newExpense
        });
    }); 
});

router.put('/:id', verifyToken, validateExpense, function(req, res, next) {
    const id = parseInt(req.params.id);
    const { type, name, category, amount, date } = req.body;
    
    // Upewniamy się, że użytkownik edytuje TYLKO SWÓJ wydatek (AND user_id = ?)
    const sql = `UPDATE expenses
                 SET type = ?, name = ?, category = ?, amount = ?, date = ?
                 WHERE id = ? AND user_id = ?`;
    const params = [type, name, category, amount, date, id, req.userId];

    db.run(sql, params, function(err) {
        if (err) return next(err);
        if (this.changes === 0) {
            return res.status(404).json({ error: "No transaction found or unauthorized." });
        }
        res.json({ message: "The transaction has been updated!" });
    });
});

router.delete('/:id', verifyToken, function(req, res, next){
    const id = parseInt(req.params.id);
    // Usuwamy tylko jeśli wydatek należy do zalogowanego użytkownika
    const sql = `DELETE FROM expenses WHERE id = ? AND user_id = ?`;

    db.run(sql, [id, req.userId], function(err) {
        if(err) return next(err);
        if(this.changes === 0) {
            return res.status(404).json({ error: "Nothing to delete or unauthorized." });
        }
        res.status(200).json({ message: "Expense deleted successfully!" });
    });
});

router.delete('/', verifyToken, function(req, res, next) {
    // Usuwamy wszystko, ale tylko dla tego konkretnego użytkownika
    const sql = "DELETE FROM expenses WHERE user_id = ?";
    
    db.run(sql, [req.userId], function(err) {
        if(err) return next(err);
        res.status(200).json({ message: "All your data cleared successfully." });
    });
});

module.exports = router;