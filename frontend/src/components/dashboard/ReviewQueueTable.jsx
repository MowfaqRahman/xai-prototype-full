import React from 'react';

const ReviewQueueTable = ({ queue, onReviewClick }) => {
    if (queue.length === 0) {
        return <div style={{ color: 'var(--secondary)', textAlign: 'center', padding: '2rem' }}>No pending applications. Queue is clear!</div>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--secondary)' }}>
                        <th style={{ padding: '1.2rem 1rem' }}>Date</th>
                        <th style={{ padding: '1.2rem 1rem' }}>Intent</th>
                        <th style={{ padding: '1.2rem 1rem' }}>Requested Loan</th>
                        <th style={{ padding: '1.2rem 1rem' }}>Income</th>
                        <th style={{ padding: '1.2rem 1rem' }}>AI Default Risk</th>
                        <th style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {queue.map((app) => (
                        <tr 
                            key={app.application_id} 
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <td style={{ padding: '1.2rem 1rem', color: '#fff' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '1.2rem 1rem', color: '#fff' }}>
                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    {app.intent}
                                </span>
                            </td>
                            <td style={{ padding: '1.2rem 1rem', color: '#fff', fontWeight: '500' }}>${app.requested_loan.toLocaleString()}</td>
                            <td style={{ padding: '1.2rem 1rem', color: 'var(--secondary)' }}>${app.applicant_income.toLocaleString()}</td>
                            <td style={{ padding: '1.2rem 1rem' }}>
                                <span style={{ 
                                    color: parseFloat(app.ai_probability_of_default) > 0.5 ? 'var(--danger)' : 'var(--success)', 
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <i className={parseFloat(app.ai_probability_of_default) > 0.5 ? "ri-error-warning-fill" : "ri-checkbox-circle-fill"}></i>
                                    {app.ai_probability_of_default}
                                </span>
                            </td>
                            <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                                <button 
                                    onClick={() => onReviewClick(app)}
                                    className="action-btn"
                                >
                                    Review Case <i className="ri-arrow-right-line"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReviewQueueTable;