import React from 'react';

const AuditJustification = ({ reason, setReason, onDecision, loading, error }) => {
    return (
        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)' }}>
            {error && <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}><i className="ri-error-warning-line"></i> {error}</div>}
            
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Officer Audit Justification (Required)</label>
                <textarea 
                    className="glass-input"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="State the official reason for overriding or confirming the AI's assessment..."
                    style={{ minHeight: '80px', resize: 'vertical' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                    disabled={loading}
                    onClick={() => onDecision("Rejected")}
                    className="btn-reject"
                >
                    {loading ? (
                        <><div className="spinner spinner-sm" style={{ borderTopColor: '#fca5a5' }}></div> Processing...</>
                    ) : (
                        <><i className="ri-close-circle-line"></i> Reject Application</>
                    )}
                </button>
                <button 
                    disabled={loading}
                    onClick={() => onDecision("Approved")}
                    className="btn-approve"
                >
                    {loading ? (
                        <><div className="spinner spinner-sm" style={{ borderTopColor: '#86efac' }}></div> Processing...</>
                    ) : (
                        <><i className="ri-checkbox-circle-line"></i> Approve Application</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AuditJustification;
