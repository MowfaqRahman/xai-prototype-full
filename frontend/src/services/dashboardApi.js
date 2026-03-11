const BASE_URL = 'http://localhost:8000/api/dashboard';

export const fetchKPIs = async () => {
    const response = await fetch(`${BASE_URL}/kpis`);
    if (!response.ok) throw new Error('Failed to fetch KPIs');
    return response.json();
};

export const fetchQueue = async () => {
    const response = await fetch(`${BASE_URL}/queue`);
    if (!response.ok) throw new Error('Failed to fetch review queue');
    return response.json();
};

export const submitDecision = async (applicationId, decisionData) => {
    const response = await fetch(`${BASE_URL}/applications/${applicationId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decisionData)
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to submit decision');
    }
    return response.json();
};