import React, { useState } from 'react';
import LoanForm from '../components/LoanForm';
import ResultCard from '../components/ResultCard';
import { predictLoan } from '../services/api';

const LoanApplicationPage = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // This is the function that gets passed down into your LoanForm!
    const handleFormSubmit = async (formData) => {
        setLoading(true);
        setError(null);
        
        try {
            // Call the FastAPI backend
            const aiResponse = await predictLoan(formData);
            
            // If successful, save the JSON to state to trigger the ResultCard
            setResult(aiResponse);
        } catch (err) {
            setError(err.message || 'Failed to connect to the AI model.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="dashboard-header">
                <h1><strong>AI Loan</strong> Application</h1>
            </div>

            {/* Conditionally render the Form or the Result Card */}
            {!result ? (
                <LoanForm 
                    onSubmit={handleFormSubmit} 
                    loading={loading} 
                    error={error} 
                />
            ) : (
                <ResultCard 
                    result={result} 
                    onReset={() => setResult(null)} 
                />
            )}
        </div>
    );
};

export default LoanApplicationPage;