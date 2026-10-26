import { useState } from 'react';
import ReservationGetDetail from "./controllers/ReservationGetDetail.jsx";
import Login from "./login/Login.jsx";
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoomCatalog from "./rooms/RoomCatalog.jsx";
import RoomDetails from "./rooms/RoomDetails.jsx";
import AdminPanel from "./admin/AdminPanel.jsx";

export function getRoleFromToken() {
    return sessionStorage.getItem('userRole');
}
function ProtectedRoute({ children, isAuthenticated, requiredRole, currentRole }) {
    if (!isAuthenticated) return <Navigate to="/" replace />;
    if (requiredRole && currentRole !== requiredRole) return <Navigate to="/reservation" replace />;
    return children;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('authenticated') === 'true');
    const [role, setRole] = useState(() => getRoleFromToken());

    const handleLoginSuccess = (authData) => {
        sessionStorage.setItem('authenticated', 'true');
        sessionStorage.setItem('userRole', authData?.role || 'USER');
        setIsAuthenticated(true);
        setRole(authData?.role || null);
    };
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated
                            ? <Navigate to="/reservation" replace />
                            : <Login onLoginSuccess={handleLoginSuccess} />
                    }
                />
                <Route
                    path="/reservation"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <RoomCatalog />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reservation/admin"
                    element={
                        <ProtectedRoute
                            isAuthenticated={isAuthenticated}
                            requiredRole="ADMIN"
                            currentRole={role}
                        >
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/rooms/:id"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <RoomDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-reservation"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ReservationGetDetail />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
