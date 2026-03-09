const BASE_URL = 'http://localhost:8000';

export const predictLoan = async (formData) => {

    const payload = {
        person_age: parseInt(formData.person_age, 10),
        person_gender: formData.person_gender.trim().toLowerCase(),
        person_education: formData.person_education.trim(),
        person_income: parseFloat(formData.person_income),
        person_emp_exp: parseInt(formData.person_emp_exp, 10),
        person_home_ownership: formData.person_home_ownership.trim().toUpperCase(),
        loan_amnt: parseFloat(formData.loan_amnt),
        loan_intent: formData.loan_intent.trim().toUpperCase(),
        loan_int_rate: parseFloat(formData.loan_int_rate),
        cb_person_cred_hist_length: parseInt(formData.cb_person_cred_hist_length, 10),
        credit_score: parseInt(formData.credit_score, 10),
        previous_loan_defaults_on_file: formData.previous_loan_defaults_on_file.trim()
    };

    const response = await fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Prediction failed');
    }

    return await response.json();
};