import React from 'react';

const ApplicantProfile = ({ requested_loan, applicant_income, credit_score, intent }) => {
    return (
        <div>
            <div className="section-title"><i className="ri-user-line"></i> Applicant Profile</div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Requested Loan</div>
                        <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>${requested_loan?.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Annual Income</div>
                        <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>${applicant_income?.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Credit Score</div>
                        <div style={{ color: '#fff', fontSize: '1.1rem' }}>{credit_score}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Loan Intent</div>
                        <div style={{ color: '#fff', fontSize: '1.1rem' }}>{intent}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantProfile;
