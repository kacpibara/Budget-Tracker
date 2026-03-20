const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello Budget Planner! Please sent request /expenses to see all expenses');
});

module.exports = router;