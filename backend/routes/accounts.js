const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Get account details for a specific customer
router.get('/:customerId', auth, async (req, res) => {
    try {
        const [accounts] = await db.query('SELECT * FROM accounts WHERE customer_id = ?', [req.params.customerId]);
        if (accounts.length === 0) {
            return res.status(404).json({ msg: 'No accounts found for this customer' });
        }
        res.json(accounts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;