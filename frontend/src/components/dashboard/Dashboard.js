import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard({ user }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            // Admin users don't have personal accounts, so skip fetch for them
            if (user?.role === 'admin' || !user?.customerId) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/accounts/${user.customerId}`);
                setAccounts(response.data);
            } catch (err) {
                setError('Failed to fetch account details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [user]);

    const chartData = {
        labels: accounts.map(acc => `${acc.account_type} (${acc.account_number})`),
        datasets: [{
            label: 'Account Balance',
            data: accounts.map(acc => acc.balance),
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)',
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
        },],
    };

    if (loading) return <p>Loading dashboard...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    
    // Custom view for admin user
    if (user?.role === 'admin') {
      return (
        <div className="card">
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin! As an administrative user, you can manage the overall system.</p>
            <p>(Future features: View all customers, manage accounts, view system-wide transaction logs).</p>
        </div>
      );
    }

    return (
        <div>
            <h1>Your Dashboard</h1>
            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h2>Account Details</h2>
                    </div>
                    {accounts.length > 0 ? (
                        accounts.map(acc => (
                            <div key={acc.account_id} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <p><strong>Account Number:</strong> {acc.account_number}</p>
                                <p><strong>Account Type:</strong> {acc.account_type}</p>
                                <h3>Balance: ${parseFloat(acc.balance).toLocaleString()}</h3>
                            </div>
                        ))
                    ) : (
                        <p>No bank accounts found.</p>
                    )}
                </div>

                <div className="card">
                     <div className="card-header">
                        <h2>Balance Distribution</h2>
                    </div>
                    {accounts.length > 0 ? <Pie data={chartData} /> : <p>No data to display in chart.</p>}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;