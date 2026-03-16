import React from 'react';

const ActionPlan = ({ action_plan }) => {
    return (
        <div>
            <div className="section-title"><i className="ri-route-line"></i> AI Action Plan (DiCE)</div>
            {action_plan && action_plan.length > 0 ? (
                action_plan.map((plan, index) => (
                    <div key={index} style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                        <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Path {index + 1} to Safe Approval:</div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#fff', fontSize: '0.9rem' }}>
                            {plan.map((step, i) => <li key={i} style={{ marginBottom: '4px' }}>{step}</li>)}
                        </ul>
                    </div>
                ))
            ) : (
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No alternative paths generated.</div>
            )}
        </div>
    );
};

export default ActionPlan;
