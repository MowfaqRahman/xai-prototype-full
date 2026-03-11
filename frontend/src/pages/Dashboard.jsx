import React, { useState, useEffect } from 'react';
import { fetchKPIs, fetchQueue } from '../services/dashboardApi';
import ReviewQueueTable from '../components/dashboard/ReviewQueueTable';
import ReviewModal from '../components/dashboard/ReviewModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error.message);
        } else {
            navigate('/login');
        }
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [kpiData, queueData] = await Promise.all([fetchKPIs(), fetchQueue()]);
            setKpis(kpiData);
            setQueue(queueData);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><i className="ri-loader-4-line ri-spin ri-3x" style={{ color: 'var(--primary)' }}></i></div>;

    return (
        <div className="fade-in">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1><strong>Officer</strong> Overview</h1>
                
                <button 
                    onClick={handleLogout}
                    style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid rgba(239, 68, 68, 0.3)', 
                        color: '#fca5a5', 
                        padding: '0.6rem 1.2rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                    <i className="ri-logout-box-r-line"></i> Sign Out
                </button>
            </div>
            
            {/* KPI GRID */}
            {kpis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="section-title">Pending Reviews</div>
                        <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>{kpis.pending_reviews}</h2>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="section-title">Approval Rate</div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--success)', margin: 0 }}>{kpis.approval_rate}%</h2>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="section-title">Approved Value</div>
                        <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>${kpis.total_approved_value.toLocaleString()}</h2>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="section-title">Avg Portfolio Risk</div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--danger)', margin: 0 }}>{kpis.average_portfolio_risk}%</h2>
                    </div>
                </div>
            )}

            {/* QUEUE TABLE */}
            <div className="glass-card" style={{ maxWidth: '100%', padding: '0' }}>
                <div className="card-title" style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
                    <i className="ri-list-check-2"></i> Needs Manual Review
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <ReviewQueueTable 
                        queue={queue} 
                        onReviewClick={(app) => setSelectedApp(app)} 
                    />
                </div>
            </div>

            {/* DECISION MODAL */}
            {selectedApp && (
                <ReviewModal 
                    application={selectedApp} 
                    onClose={() => setSelectedApp(null)}
                    onSuccess={() => {
                        setSelectedApp(null);
                        loadDashboardData(); 
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;