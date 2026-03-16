import React, { useState, useEffect } from 'react';
import {
    fetchKPIs, fetchQueue, fetchTrend,
    fetchProductPerformance, fetchRiskSegmentation, fetchDefaultReasons,
    fetchRiskDistribution, fetchHomeOwnership
} from '../services/dashboardApi';
import {
    TrendChart, ProductPerformance,
    RiskSegmentation, DefaultReasons, RiskCreditScatter, HomeOwnershipPie
} from '../components/dashboard/DashboardCharts';
import ReviewQueueTable from '../components/dashboard/ReviewQueueTable';
import ReviewModal from '../components/dashboard/ReviewModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [queue, setQueue] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [reasonData, setReasonData] = useState(null);
    const [distributionData, setDistributionData] = useState(null);
    const [homeData, setHomeData] = useState(null);
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

    const loadDashboardData = () => {
        fetchKPIs().then(setKpis).catch(err => console.error("Error fetching KPIs:", err));
        fetchQueue().then(setQueue).catch(err => console.error("Error fetching queue:", err));
        fetchTrend().then(setTrendData).catch(err => console.error("Error fetching trend:", err));
        fetchProductPerformance().then(setProductData).catch(err => console.error("Error fetching product performance:", err));
        fetchRiskSegmentation().then(setRiskData).catch(err => console.error("Error fetching risk segmentation:", err));
        fetchDefaultReasons().then(setReasonData).catch(err => console.error("Error fetching default reasons:", err));
        fetchRiskDistribution().then(setDistributionData).catch(err => console.error("Error fetching risk distribution:", err));
        fetchHomeOwnership().then(setHomeData).catch(err => console.error("Error fetching home ownership:", err));
    };

    useEffect(() => {
        loadDashboardData();
    }, []);


    return (
        <div className="fade-in" style={{ paddingBottom: '3rem' }}>
            {/* HEADER */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}><strong>Officer</strong> Overview</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="ri-logout-box-r-line"></i> Sign Out
                    </button>
                </div>
            </div>

            {/* TOP KPI ROW */}
            {kpis ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                    <KPICard title="Total Application" value={kpis.total_applications.toLocaleString()} trend="+8.4% vs last month" icon="ri-file-list-3-line" />
                    <KPICard title="Approval Rate" value={`${kpis.approval_rate}%`} trend="+2.1%" icon="ri-checkbox-circle-line" />
                    <KPICard title="Disbursement Rate" value={`${kpis.disbursement_rate}%`} trend="Stable" icon="ri-exchange-dollar-line" />
                    <KPICard title="Default Rate" value={`${kpis.default_rate}%`} trend="+0.4%" icon="ri-error-warning-line" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                    {[1, 2, 3, 4].map(i => <KPICardSkeleton key={i} />)}
                </div>
            )}

            {/* STRATEGIC INSIGHTS ROW */}
            {/* RISK & SEGMENTATION ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* [UI-1] RISK VS CREDIT SCORE DISTRIBUTION */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-bubble-chart-line"></i> Risk vs Credit Score Distribution</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Portfolio mapping: Credit score vs default probability</div>
                    {distributionData ? <RiskCreditScatter data={distributionData} /> : <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>}
                </div>

                {/* [UI-2] RISK SEGMENTATION */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-donut-chart-line"></i> Risk Segmentation</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Portfolio breakdown by risk category</div>
                    <div style={{ marginTop: '2rem' }}>
                        {riskData ? <RiskSegmentation data={riskData} /> : <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>}
                    </div>
                </div>
            </div>

            {/* TREND & PERFORMANCE ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* [UI-3] APPROVED VS REJECTED TREND */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><i className="ri-line-chart-line"></i> Approved vs Rejected Trend</span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>12 Month History</span>
                    </div>
                    {trendData ? <TrendChart data={trendData} /> : <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>}
                </div>

                {/* [UI-4] PRODUCT PERFORMANCE */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-bar-chart-box-line"></i> Product Performance</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Approval volume by loan purpose</div>
                    {productData ? <ProductPerformance data={productData} /> : <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>}
                </div>
            </div>

            {/* DRILL-DOWN GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* [UI-5] HOME OWNERSHIP */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-home-4-line"></i> Home Ownership</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Applicant demographic profile</div>
                    {homeData ? <HomeOwnershipPie data={homeData} /> : <div className="skeleton" style={{ width: '100%', height: '250px' }}></div>}
                </div>

                {/* [UI-6] TOP DEFAULT REASONS */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="card-title"><i className="ri-list-alert-line"></i> Top Default Reasons</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>AI-derived risk factors</div>
                    {reasonData ? <DefaultReasons data={reasonData} /> : <div className="skeleton" style={{ width: '100%', height: '250px' }}></div>}
                </div>
            </div>

            {/* QUEUE TABLE */}
            <div className="glass-card" style={{ maxWidth: '100%', padding: '0' }}>
                <div className="card-title" style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
                    <i className="ri-list-check-2"></i> Manual Review Queue
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {queue ? (
                        <ReviewQueueTable
                            queue={queue}
                            onReviewClick={(app) => setSelectedApp(app)}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="skeleton" style={{ width: '100%', height: '2.5rem' }}></div>
                            ))}
                        </div>
                    )}
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

// Helper Components
const KPICard = ({ title, value, trend, icon, color = '#fff' }) => (
    <div className="glass-card" style={{ padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>{title}</span>
            <i className={`${icon}`} style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.2)' }}></i>
        </div>
        <h2 style={{ fontSize: '1.8rem', color: color, margin: '0.2rem 0' }}>{value}</h2>
        <div style={{ fontSize: '0.75rem', color: trend.includes('+') ? 'var(--success)' : (trend.includes('Above') ? 'var(--danger)' : '#94a3b8') }}>
            {trend.includes('+') ? <i className="ri-arrow-up-line"></i> : trend.includes('Above') ? <i className="ri-arrow-up-line"></i> : null} {trend}
        </div>
    </div>
);

const KPICardSkeleton = () => (
    <div className="glass-card" style={{ padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div className="skeleton" style={{ width: '60%', height: '0.85rem' }}></div>
            <div className="skeleton" style={{ width: '1.2rem', height: '1.2rem', borderRadius: '4px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '80%', height: '2.16rem', margin: '0.2rem 0' }}></div>
        <div className="skeleton" style={{ width: '40%', height: '0.75rem', marginTop: '0.4rem' }}></div>
    </div>
);





export default Dashboard;