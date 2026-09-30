import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const statusLabels = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

const statusColors = {
    PENDING: '#b8860b',
    APPROVED: '#2e7d32',
    REJECTED: '#c62828',
};

function ReservationGetDetail() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
    const navigate = useNavigate();

    const fetchMyReservations = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_BASE}/reservation/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservations(response.data || []);
        } catch (err) {
            console.error('Error loading reservations', err);
            setError('Could not load your reservations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyReservations();
    }, []);

    return (
        <div style={{ padding: '32px', maxWidth: '860px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>My Reservations</h2>
                    <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>
                        View and track your room bookings
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link to="/reservation" style={{ color: '#555', textDecoration: 'none', fontSize: '14px' }}>
                        ← Back to Rooms
                    </Link>
                    <button
                        onClick={fetchMyReservations}
                        style={{
                            padding: '8px 18px',
                            background: '#1a1a1a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {error && (
                <p style={{ color: '#c62828', background: '#fff3f3', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #ffd0d0' }}>
                    {error}
                </p>
            )}

            {loading ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>Loading your reservations...</p>
            ) : reservations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888', border: '1px dashed #ccc', borderRadius: '12px' }}>
                    <p style={{ fontSize: '20px', marginBottom: '8px' }}>No reservations yet.</p>
                    <p style={{ margin: 0 }}>
                        Go to{' '}
                        <Link to="/reservation" style={{ color: '#888', fontWeight: 600 }}>Rooms</Link>{' '}
                        to make a booking.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reservations.map((r) => (
                        <div
                            key={r.id}
                            style={{
                                border: '1px solid #e4e4e4',
                                borderRadius: '12px',
                                padding: '20px 24px',
                                background: '#fff',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                            }}
                        >
                            {/* Card header: reservation # + status badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>
                                    Reservation #{r.id}
                                </span>
                                <span style={{
                                    padding: '4px 14px',
                                    borderRadius: '20px',
                                    background: statusColors[r.status] || '#888',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    letterSpacing: '0.4px'
                                }}>
                                    {statusLabels[r.status] || r.status}
                                </span>
                            </div>

                            {/* Card body: 2-column grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                                {/* Room name — clickable link */}
                                <div>
                                    <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                        Room
                                    </div>
                                    <button
                                        onClick={() => navigate(`/rooms/${r.roomId}`)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            color: '#1a1a1a',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            textUnderlineOffset: '2px'
                                        }}
                                    >
                                        {r.roomName || `Room #${r.roomId}`}
                                        {r.roomNumber && (
                                            <span style={{ fontWeight: 400, color: '#777', marginLeft: '6px' }}>
                                                (№{r.roomNumber})
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Guest name */}
                                <div>
                                    <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                        Guest
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#333', fontWeight: 500 }}>
                                        {r.userName || `User #${r.userId}`}
                                    </div>
                                </div>

                                {/* Check-in */}
                                <div>
                                    <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                        Check-in
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#333' }}>{r.startDate}</div>
                                </div>

                                {/* Check-out */}
                                <div>
                                    <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                        Check-out
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#333' }}>{r.endDate}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReservationGetDetail;
