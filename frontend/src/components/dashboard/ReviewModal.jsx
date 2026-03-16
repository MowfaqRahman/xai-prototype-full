import React, { useState } from 'react';
import { submitDecision } from '../../services/dashboardApi';
import ApplicantProfile from './review/ApplicantProfile';
import ActionPlan from './review/ActionPlan';
import RiskAssessment from './review/RiskAssessment';
import AuditJustification from './review/AuditJustification';

const ReviewModal = ({ application, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentOfficerName = "Officer_Admin_01"; 

    const handleDecision = async (decisionType) => {
        if (reason.length < 5) {
            setError("You must provide a detailed reason for the audit log (min 5 characters).");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await submitDecision(application.application_id, {
                decision: decisionType,
                officer_name: currentOfficerName,
                override_reason: reason
            });
            onSuccess();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '900px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                
                {/* MODAL HEADER */}
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                        <h3 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="ri-file-search-line" style={{ color: 'var(--primary)' }}></i> 
                            Application Review
                        </h3>
                        <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                            ID: {application.application_id}
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }} 
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} 
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <i className="ri-close-line" style={{ fontSize: '1.2rem' }}></i>
                    </button>
                </div>

                {/* SCROLLABLE CONTENT BODY */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    
                    {/* LEFT COLUMN: APPLICANT DATA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <ApplicantProfile 
                            requested_loan={application.requested_loan}
                            applicant_income={application.applicant_income}
                            credit_score={application.credit_score}
                            intent={application.intent}
                        />

                        <ActionPlan action_plan={application.action_plan} />
                    </div>

                    {/* RIGHT COLUMN: AI ANALYSIS */}
                    <div>
                        <RiskAssessment 
                            riskProbability={application.ai_probability_of_default}
                            shapExplanations={application.shap_explanations}
                        />
                    </div>
                </div>

                {/* FOOTER: AUDIT LOGIC & ACTIONS */}
                <AuditJustification 
                    reason={reason}
                    setReason={setReason}
                    onDecision={handleDecision}
                    loading={loading}
                    error={error}
                />

            </div>
        </div>
    );
};

export default ReviewModal;