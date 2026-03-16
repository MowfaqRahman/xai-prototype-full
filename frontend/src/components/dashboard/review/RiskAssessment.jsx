import React from 'react';

const RiskAssessment = ({ riskProbability, shapExplanations }) => {
    // Helper to format feature names (e.g., "loan_percent_income" -> "Loan Percent Income")
    const formatFeatureName = (name) => {
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div className="section-title" style={{ margin: 0 }}><i className="ri-brain-line"></i> AI Risk Assessment</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{riskProbability} Risk</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 'bold' }}>Top Influencing Factors (SHAP)</div>
                
                {shapExplanations?.map((factor, idx) => {
                    const isRisk = factor.impact_direction.includes('Risk');
                    return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: idx !== shapExplanations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                            <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{formatFeatureName(factor.feature)}</div>
                            <div style={{ color: isRisk ? '#fca5a5' : '#86efac', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', background: isRisk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                                <i className={isRisk ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
                                {Math.abs(factor.impact_score).toFixed(2)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default RiskAssessment;
