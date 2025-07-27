import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function TransactionStatement({ user }) {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [statement, setStatement] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
    
    const handleGenerateStatement = async (e) => {
        e.preventDefault();
        if (!selectedAccountId || !startDate || !endDate) {
            setError('Please select an account and both a start and end date.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // Ensure the end date covers the entire day
            const fullEndDate = `${endDate}T23:59:59`;
            const response = await api.get(`/transactions/statement/${selectedAccountId}`, {
                params: { startDate, endDate: fullEndDate }
            });
            setStatement(response.data);
        } catch (err) {
            setError('Failed to generate statement.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2>Generate Transaction Statement</h2>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleGenerateStatement} className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap'}}>
                <div>
                    <label>Account</label>
                    <select className="form-control" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>
                        {accounts.map(acc => (
                            <option key={acc.account_id} value={acc.account_id}>
                                {acc.account_type} - {acc.account_number}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Start Date</label>
                    <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                 <div>
                    <label>End Date</label>
                    <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary">Generate</button>
            </form>

            <hr />

            <h3>Statement Results</h3>
            {loading ? <p>Loading...</p> : (
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
                        {statement.length > 0 ? (
                            statement.map(tx => (
                                <tr key={tx.transaction_id}>
                                    <td>{new Date(tx.transaction_date).toLocaleString()}</td>
                                    <td>{tx.description}</td>
                                    <td>
                                        {tx.sender_account_id === parseInt(selectedAccountId) ? 
                                            <span style={{color: 'red'}}>SENT</span> : 
                                            <span style={{color: 'green'}}>RECEIVED</span>
                                        }
                                    </td>
                                    <td style={{ color: tx.sender_account_id === parseInt(selectedAccountId) ? 'red' : 'green' }}>
                                        ${parseFloat(tx.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4">No transactions found for the selected period.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default TransactionStatement;