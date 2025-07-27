import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function TransferMoney({ user }) {
    const [accounts, setAccounts] = useState([]);
    const [senderAccountId, setSenderAccountId] = useState('');
    const [recipients, setRecipients] = useState([{ accountNumber: '', amount: '' }]);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
             if (!user?.customerId) return;
            try {
                const response = await api.get(`/accounts/${user.customerId}`);
                setAccounts(response.data);
                if (response.data.length > 0) {
                    setSenderAccountId(response.data[0].account_id);
                }
            } catch (err) {
                setError('Failed to fetch your accounts.');
            }
        };
        fetchAccounts();
    }, [user]);

    const handleRecipientChange = (index, event) => {
        const values = [...recipients];
        values[index][event.target.name] = event.target.name === 'amount' ? parseFloat(event.target.value) || '' : event.target.value;
        setRecipients(values);
    };

    const handleAddRecipient = () => {
        setRecipients([...recipients, { accountNumber: '', amount: '' }]);
    };

    const handleRemoveRecipient = (index) => {
        const values = [...recipients];
        values.splice(index, 1);
        setRecipients(values);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!senderAccountId) {
            setError('Please select a sending account.');
            return;
        }

        const transfers = recipients.map(r => ({
            receiver_account_number: r.accountNumber,
            amount: r.amount,
            description: description || 'Bank Transfer'
        }));
        
        try {
            await api.post('/transactions/transfer', {
                sender_account_id: parseInt(senderAccountId),
                transfers
            });
            setSuccess('Transfer successful!');
            // Reset form
            setRecipients([{ accountNumber: '', amount: '' }]);
            setDescription('');
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred during the transfer.');
        }
    };
    
    return (
        <div className="card">
             <div className="card-header">
                <h2>Transfer Money</h2>
            </div>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <div className="form-group">
                    <label>From Account:</label>
                    <select className="form-control" value={senderAccountId} onChange={e => setSenderAccountId(e.target.value)}>
                        {accounts.map(acc => (
                            <option key={acc.account_id} value={acc.account_id}>
                                {acc.account_type} - {acc.account_number} (${parseFloat(acc.balance).toLocaleString()})
                            </option>
                        ))}
                    </select>
                </div>
                
                <hr/>
                <h4>Recipients</h4>
                {recipients.map((recipient, index) => (
                    <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            name="accountNumber"
                            placeholder="Recipient Account Number"
                            className="form-control"
                            value={recipient.accountNumber}
                            onChange={e => handleRecipientChange(index, e)}
                            required
                        />
                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            className="form-control"
                            value={recipient.amount}
                            onChange={e => handleRecipientChange(index, e)}
                            required
                            min="0.01"
                            step="0.01"
                        />
                         <button type="button" className="btn btn-danger" onClick={() => handleRemoveRecipient(index)}>X</button>
                    </div>
                ))}
                 <button type="button" className="btn btn-secondary" onClick={handleAddRecipient}>Add Another Recipient</button>

                <hr/>
                 <div className="form-group">
                    <label>Description (Optional)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Rent payment"
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}>Submit Transfer</button>
            </form>
        </div>
    );
}

export default TransferMoney;