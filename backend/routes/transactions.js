const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Get transaction history for an account
router.get('/:accountId', auth, async (req, res) => {
    try {
        const [transactions] = await db.query(
            `SELECT * FROM transactions 
             WHERE sender_account_id = ? OR receiver_account_id = ? 
             ORDER BY transaction_date DESC`,
            [req.params.accountId, req.params.accountId]
        );
        res.json(transactions);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create a new transaction (one-to-one or one-to-many)
router.post('/transfer', auth, async (req, res) => {
    const { sender_account_id, transfers } = req.body; // transfers is an array of { receiver_account_number, amount, description }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check sender's balance
        const [senderRows] = await connection.query('SELECT balance FROM accounts WHERE account_id = ?', [sender_account_id]);
        let senderBalance = senderRows[0].balance;
        const totalTransferAmount = transfers.reduce((sum, t) => sum + t.amount, 0);

        if (senderBalance < totalTransferAmount) {
            await connection.rollback();
            return res.status(400).json({ msg: 'Insufficient funds' });
        }

        // Process each transfer
        for (const transfer of transfers) {
            const { receiver_account_number, amount, description } = transfer;

            const [receiverRows] = await connection.query('SELECT account_id FROM accounts WHERE account_number = ?', [receiver_account_number]);
            if (receiverRows.length === 0) {
                throw new Error(`Receiver account ${receiver_account_number} not found.`);
            }
            const receiver_account_id = receiverRows[0].account_id;

            // Deduct from sender
            await connection.query('UPDATE accounts SET balance = balance - ? WHERE account_id = ?', [amount, sender_account_id]);
            // Add to receiver
            await connection.query('UPDATE accounts SET balance = balance + ? WHERE account_id = ?', [amount, receiver_account_id]);
            // Log transaction
            await connection.query(
                'INSERT INTO transactions (sender_account_id, receiver_account_id, amount, transaction_type, description) VALUES (?, ?, ?, ?, ?)',
                [sender_account_id, receiver_account_id, amount, 'TRANSFER', description]
            );
        }

        await connection.commit();
        res.status(201).json({ msg: 'Transfer(s) successful' });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        res.status(500).json({ msg: err.message });
    } finally {
        connection.release();
    }
});

// Get transaction statement
router.get('/statement/:accountId', auth, async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const [statement] = await db.query(
            `SELECT * FROM transactions 
             WHERE (sender_account_id = ? OR receiver_account_id = ?) 
             AND transaction_date BETWEEN ? AND ? ORDER BY transaction_date DESC`,
            [req.params.accountId, req.params.accountId, startDate, endDate]
        );
        res.json(statement);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
