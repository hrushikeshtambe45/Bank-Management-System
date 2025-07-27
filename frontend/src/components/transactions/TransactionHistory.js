import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function TransactionHistory({ user }) {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch user's accounts to populate the dropdown
    useEffect(() => {
        const fetchAccounts = async () => {
             if (!user?.customerId) return;
            try {
                const response = await api.get(`/accounts/${user.customerId}`);
                setAccounts(response.data);
                if (response.data.length > 0) {
                    setSelectedAccountId(response.data[0].account_id);
                }
            } catch (err) {
                setError('Failed to fetch accounts.');
            }
        };
        fetchAccounts();
    }, [user]);

    // Fetch transactions when the selected account changes
    useEffect(() => {
        if (!selectedAccountId) return;
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/transactions/${selectedAccountId}`);
                setTransactions(response.data);
            } catch (err) {
                setError('Failed to fetch transaction history.');
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [selectedAccountId]);

    return (
        <div className="card">
            <div className="card-header">
                <h2>Transaction History</h2>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div className="form-group">
                <label htmlFor="account-select">Select Account</label>
                <select 
                    id="account-select"
                    className="form-control" 
                    value={selectedAccountId} 
                    onChange={e => setSelectedAccountId(e.target.value)}
                >
                    {accounts.map(acc => (
                        <option key={acc.account_id} value={acc.account_id}>
                            {acc.account_type} - {acc.account_number} (${parseFloat(acc.balance).toLocaleString()})
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p>Loading transactions...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <tr key={tx.transaction_id}>
                                    <td>{new Date(tx.transaction_date).toLocaleString()}</td>
                                    <td>{tx.description}</td>
                                    <td>
                                        {tx.sender_account_id === parseInt(selectedAccountId) ? (
                                             <span style={{ color: 'red' }}>SENT</span>
                                        ) : (
                                             <span style={{ color: 'green' }}>RECEIVED</span>
                                        )}
                                    </td>
                                    <td style={{ color: tx.sender_account_id === parseInt(selectedAccountId) ? 'red' : 'green' }}>
                                        ${parseFloat(tx.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No transactions found for this account.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default TransactionHistory;