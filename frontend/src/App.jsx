import { useState } from 'react';
import ReservationGetDetail from "./controllers/ReservationGetDetail.jsx";
import Login from "./login/Login.jsx"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function ProtectedRoute({children, isAuthenticated}){
    return isAuthenticated ?  children : <Navigate to="/" replace />;
}

function  App(){
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => Boolean(localStorage.getItem('accessToken'))
    );
    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route
                    path="/reservation"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <ReservationGetDetail />
                        </ProtectedRoute>}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;
