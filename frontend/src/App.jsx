import { useState } from 'react';
import ReservationGetDetail from "./controllers/ReservationGetDetail.jsx";
import Login from "./login/Login.jsx";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoomCatalog from "./rooms/RoomCatalog.jsx";
import RoomDetails from "./rooms/RoomDetails.jsx";

function ProtectedRoute({ children, isAuthenticated }) {
    return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => Boolean(localStorage.getItem('accessToken'))
    );
    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
}

export default App;
