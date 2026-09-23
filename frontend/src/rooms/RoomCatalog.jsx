import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RoomCatalog.module.css';

const fallbackRooms = [
    {
        id: 1,
        roomNumber: '101',
        name: 'Classic Room',
        description: 'A bright room with a double bed, comfortable seating, and breakfast included.',
        capacity: 2,
        pricePerNight: 89.00,
        imageUrl: 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images.jpeg'
    },
    {
        id: 2,
        roomNumber: '201',
        name: 'Comfort Room',
        description: 'A spacious room with a dedicated lounge area, courtyard view, and modern amenities.',
        capacity: 3,
        pricePerNight: 119.00,
        imageUrl: 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(3).jpeg'
    },
    {
        id: 3,
        roomNumber: '301',
        name: 'Suite with Living Room',
        description: 'An elegant suite with a separate living room, panoramic windows, and thoughtful luxury details.',
        capacity: 4,
        pricePerNight: 169.00,
        imageUrl: 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(6).jpeg'
    }
];

function RoomCard({ room, onSelectRoom }) {
    const [imageError, setImageError] = useState(false);

    return (
        <article
            className={styles.card}
            onClick={() => onSelectRoom(room.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectRoom(room.id); }}
        >
            <div className={styles.photo}>
                {!imageError && room.imageUrl ? (
                    <img
                        className={styles.photoImage}
                        src={room.imageUrl}
                        alt={`Photo of ${room.name}`}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.imageFallback}>Photo unavailable</div>
                )}
                <span className={styles.photoLabel}>ROOM {room.roomNumber}</span>
                <span className={styles.priceBadge}>${room.pricePerNight} <small>/ night</small></span>
            </div>

            <div className={styles.cardBody}>
                <p className={styles.subtitle}>Up to {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}</p>
                <h2 className={styles.roomName}>{room.name}</h2>
                <p className={styles.description}>{room.description}</p>
                
                <ul className={styles.features}>
                    <li>Up to {room.capacity} guests</li>
                    <li>High-speed Wi-Fi</li>
                    <li>Air conditioning</li>
                </ul>

                <div className={styles.detailsNote}>
                    <span>View & Select Dates</span>
                    <span className={styles.arrow} aria-hidden="true">→</span>
                </div>
            </div>
        </article>
    );
}

function RoomCatalog() {
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(`${API_BASE}/rooms`, config);
                if (res.data && res.data.length > 0) {
                    setRooms(res.data);
                } else {
                    setRooms(fallbackRooms);
                }
            } catch (err) {
                console.warn('Could not load rooms from backend, using default catalog:', err);
                setRooms(fallbackRooms);
                setError('Backend is offline or unreachable. Displaying cached rooms.');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [API_BASE]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        window.location.assign('/');
    };

    const handleSelectRoom = (roomId) => {
        navigate(`/rooms/${roomId}`);
    };

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <a className={styles.brand} href="/reservation" aria-label="Quiet Shore home">Quiet Shore</a>
                <nav className={styles.nav} aria-label="Main navigation">
                    <a className={styles.activeLink} href="/reservation">Rooms</a>
                    <a href="/my-reservation">My reservations</a>
                </nav>
                <button className={styles.logout} type="button" onClick={handleLogout}>Log out</button>
            </header>

            <section className={styles.intro}>
                <p className={styles.eyebrow}>YOUR PLACE TO REST</p>
                <h1>Choose a room for your stay</h1>
                <p className={styles.introText}>
                    Thoughtful interiors, quiet surroundings, and modern comfort. Click any room to check availability and reserve dates.
                </p>
            </section>

            <section className={styles.catalog} aria-label="Available room types">
                <div className={styles.sectionHeading}>
                    <div>
                        <p className={styles.eyebrow}>ACCOMMODATION</p>
                        <h2>Our Rooms & Suites</h2>
                    </div>
                    <p>Select a room to view details and book available dates on the calendar.</p>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Loading rooms...</p>
                    </div>
                ) : (
                    <>
                        {error && <div className={styles.warningNote}>{error}</div>}
                        <div className={styles.grid}>
                            {rooms.map((room) => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    onSelectRoom={handleSelectRoom}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>

            <footer className={styles.footer}>
                <span>Quiet Shore</span>
                <span>Rest at your own pace</span>
            </footer>
        </main>
    );
}

export default RoomCatalog;
