import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoanApplicationPage from './pages/LoanApplicationPage';
import "./App.css"

function App() {
    return (
        <Router>
            <div className="app-container">
                {/* VERTICAL SIDEBAR */}
                <aside className="sidebar">
                    <div className="logo-icon">
                        <i className="ri-bank-line"></i>
                    </div>
                    
                    {/* Applicant Form Link */}
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => isActive && window.location.pathname === '/' ? "nav-item active" : "nav-item"}
                        title="New Application"
                    >
                        <i className="ri-file-add-line"></i>
                    </NavLink>

                    {/* Officer Portal Link */}
                    <NavLink 
                        to="/dashboard" 
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        title="Officer Portal"
                    >
                        <i className="ri-shield-user-line"></i>
                    </NavLink>
                </aside>

                {/* MAIN SCROLLABLE CONTENT AREA */}
                <main className="dashboard-main">
                    <Routes>
                        <Route path="/" element={<LoanApplicationPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;