import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './RoomDetails.module.css';

// Fallback catalog in case backend is offline
const fallbackRoomsMap = {
    1: {
        id: 1,
        roomNumber: '101',
        name: 'Classic Room',
        description: 'A bright room with a double bed, comfortable seating, and breakfast included.',
        capacity: 2,
        pricePerNight: 89.00,
        imageUrl: 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images.jpeg'
    },
    2: {
        id: 2,
        roomNumber: '201',
        name: 'Comfort Room',
        description: 'A spacious room with a dedicated lounge area, courtyard view, and modern amenities.',
        capacity: 3,
        pricePerNight: 119.00,
        imageUrl: 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(3).jpeg'
    },
    3: {
        id: 3,
        roomNumber: '301',
        name: 'Suite with Living Room',
        description: 'An elegant suite with a separate living room, panoramic windows, and thoughtful luxury details.',
        capacity: 4,
        pricePerNight: 169.00,
        imageUrl: 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images%20(6).jpeg'
    }
};

// Format Date object to YYYY-MM-DD
function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function RoomDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

    const [room, setRoom] = useState(null);
    const [bookedRanges, setBookedRanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Calendar state
    const today = useMemo(() => new Date(), []);
    const todayISO = useMemo(() => formatDateToISO(today), [today]);
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    const token = localStorage.getItem('accessToken');

    // Fetch room data and booked dates
    const loadRoomData = async () => {
        setLoading(true);
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            // 1. Fetch Room Details
            const roomRes = await axios.get(`${API_BASE}/rooms/${id}`, config);
            setRoom(roomRes.data);

            // 2. Fetch Booked Dates for this room
            try {
                const datesRes = await axios.get(`${API_BASE}/rooms/${id}/booked-dates`, config);
                setBookedRanges(datesRes.data || []);
            } catch (datesErr) {
                console.warn('Could not fetch booked dates:', datesErr);
                setBookedRanges([]);
            }
        } catch (err) {
            console.warn('Error loading room from API, checking fallback:', err);
            const fallback = fallbackRoomsMap[id] || fallbackRoomsMap[1];
            setRoom(fallback);
            setError('Using local room preview mode.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoomData();
    }, [id, API_BASE]);

    // Check if a specific date (YYYY-MM-DD) is already booked
    const isDateBooked = (dateStr) => {
        return bookedRanges.some(range => {
            return dateStr >= range.startDate && dateStr <= range.endDate;
        });
    };

    // Check if a date is in the past
    const isPastDate = (dateStr) => {
        return dateStr < todayISO;
    };

    // Month Navigation
    const handlePrevMonth = () => {
        setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Generate Calendar Grid for currentMonthDate
    const calendarDays = useMemo(() => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Day of week: 0 = Sun, 1 = Mon ... Convert so Mon = 0, Sun = 6
        let startDay = firstDayOfMonth.getDay() - 1;
        if (startDay === -1) startDay = 6;

        const totalDays = lastDayOfMonth.getDate();
        const days = [];

        // Empty padding cells for previous month days
        for (let i = 0; i < startDay; i++) {
            days.push({ key: `empty-${i}`, empty: true });
        }

        // Days of current month
        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = formatDateToISO(dateObj);
            const isBooked = isDateBooked(dateStr);
            const isPast = isPastDate(dateStr);
            const isDisabled = isPast || isBooked;

            days.push({
                key: dateStr,
                empty: false,
                dayNumber: day,
                dateStr,
                isBooked,
                isPast,
                isDisabled
            });
        }

        return days;
    }, [currentMonthDate, bookedRanges, todayISO]);

    // Handle day click
    const handleDayClick = (dayObj) => {
        if (dayObj.isDisabled) return;

        setBookingError('');
        setBookingSuccess('');

        const selected = dayObj.dateStr;

        if (!checkIn || (checkIn && checkOut)) {
            // First click sets check-in
            setCheckIn(selected);
            setCheckOut(null);
        } else if (checkIn && !checkOut) {
            // Second click
            if (selected <= checkIn) {
                // If clicking an earlier date, restart selection with new check-in
                setCheckIn(selected);
            } else {
                // Check if any date in between is booked
                let curr = new Date(checkIn);
                const end = new Date(selected);
                let hasBookedInRange = false;

                while (curr <= end) {
                    const iso = formatDateToISO(curr);
                    if (isDateBooked(iso)) {
                        hasBookedInRange = true;
                        break;
                    }
                    curr.setDate(curr.getDate() + 1);
                }

                if (hasBookedInRange) {
                    setBookingError('The selected interval contains dates that are already reserved. Please select another date range.');
                } else {
                    setCheckOut(selected);
                }
            }
        }
    };

    // Calculate nights & total price
    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [checkIn, checkOut]);

    const totalPrice = useMemo(() => {
        if (!room || nights === 0) return 0;
        return (nights * Number(room.pricePerNight)).toFixed(2);
    }, [room, nights]);

    // Submit reservation
    const handleBookReservation = async () => {
        if (!checkIn || !checkOut) {
            setBookingError('Please select both Check-in and Check-out dates.');
            return;
        }

        if (!token) {
            setBookingError('You need to be logged in to book a room. Please log in first.');
            return;
        }

        setBookingLoading(true);
        setBookingError('');
        setBookingSuccess('');

        try {
            const payload = {
                userId: 1, // Will be linked to authenticated principal on backend
                roomId: room.id,
                startDate: checkIn,
                endDate: checkOut
            };

            await axios.post(`${API_BASE}/reservation`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setBookingSuccess(`Room ${room.roomNumber} successfully reserved from ${checkIn} to ${checkOut}! Status: PENDING.`);
            
            // Refresh booked dates so new reservation dates are disabled immediately
            const datesRes = await axios.get(`${API_BASE}/rooms/${id}/booked-dates`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookedRanges(datesRes.data || []);

            // Clear selection
            setCheckIn(null);
            setCheckOut(null);
        } catch (err) {
            console.error('Reservation error:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to complete reservation. The dates may conflict with an existing booking.';
            setBookingError(msg);
        } finally {
            setBookingLoading(false);
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const isPrevMonthDisabled = currentMonthDate.getFullYear() === today.getFullYear() &&
        currentMonthDate.getMonth() <= today.getMonth();

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner} />
                    <p>Loading room details...</p>
                </div>
            </main>
        );
    }

    if (!room) {
        return (
            <main className={styles.page}>
                <div className={styles.container}>
                    <h2>Room not found</h2>
                    <button className={styles.backBtn} onClick={() => navigate('/reservation')}>
                        ← Back to Rooms Catalog
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/reservation')}>
                    ← Back to Rooms
                </button>
                <Link className={styles.brand} to="/reservation">Quiet Shore</Link>
                <nav className={styles.nav}>
                    <Link to="/reservation">Rooms</Link>
                    <Link to="/my-reservation">My reservations</Link>
                </nav>
                <button
                    className={styles.logout}
                    onClick={() => {
                        localStorage.removeItem('accessToken');
                        navigate('/');
                    }}
                >
                    Log out
                </button>
            </header>

            <div className={styles.container}>
                {error && <div className={styles.errorAlert}>{error}</div>}

                <div className={styles.layout}>
                    {/* Left Column: Room Presentation */}
                    <section className={styles.roomMain}>
                        <div className={styles.heroImageWrapper}>
                            <img
                                className={styles.heroImage}
                                src={room.imageUrl}
                                alt={room.name}
                                onError={(e) => {
                                    e.target.src = 'https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/images.jpeg';
                                }}
                            />
                            <span className={styles.roomBadge}>ROOM {room.roomNumber}</span>
                        </div>

                        <div className={styles.roomTitleRow}>
                            <h1 className={styles.title}>{room.name}</h1>
                            <div className={styles.priceTag}>
                                ${room.pricePerNight} <small>/ night</small>
                            </div>
                        </div>

                        <div className={styles.metaTags}>
                            <span className={styles.tag}>👥 Up to {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}</span>
                            <span className={styles.tag}>📶 High-speed Wi-Fi</span>
                            <span className={styles.tag}>☕ Breakfast included</span>
                            <span className={styles.tag}>❄️ Climate Control</span>
                        </div>

                        <div>
                            <h2 className={styles.sectionSubtitle}>About this room</h2>
                            <p className={styles.description}>{room.description}</p>
                        </div>

                        <div>
                            <h2 className={styles.sectionSubtitle}>Included Amenities</h2>
                            <div className={styles.amenitiesGrid}>
                                <div className={styles.amenityItem}><span className={styles.amenityIcon}>✓</span> King/Double Bed</div>
                                <div className={styles.amenityItem}><span className={styles.amenityIcon}>✓</span> Private Bathroom</div>
                                <div className={styles.amenityItem}><span className={styles.amenityIcon}>✓</span> Daily Housekeeping</div>
                                <div className={styles.amenityItem}><span className={styles.amenityIcon}>✓</span> Smart Flat Screen TV</div>
                                <div className={styles.amenityItem}><span className={styles.amenityIcon}>✓</span> Mini Bar & Safe</div>
                                <div className={styles.amenityItem}><span className={styles.amenityIcon}>✓</span> Soundproof Windows</div>
                            </div>
                        </div>
                    </section>

                    {/* Right Column: Interactive Booking Widget with Calendar */}
                    <aside className={styles.bookingCard}>
                        <div className={styles.widgetHeader}>
                            <h2 className={styles.widgetTitle}>Book Your Stay</h2>
                            <p className={styles.widgetNotice}>Select Check-in and Check-out dates below</p>
                        </div>

                        {bookingError && <div className={styles.errorAlert}>{bookingError}</div>}
                        {bookingSuccess && (
                            <div className={styles.successAlert}>
                                <div>{bookingSuccess}</div>
                                <Link className={styles.viewReservationsLink} to="/my-reservation">
                                    View in My Reservations →
                                </Link>
                            </div>
                        )}

                        {/* Month Calendar Component */}
                        <div className={styles.calendarWrapper}>
                            <div className={styles.calendarNav}>
                                <button
                                    className={styles.navArrowBtn}
                                    onClick={handlePrevMonth}
                                    disabled={isPrevMonthDisabled}
                                    title="Previous Month"
                                >
                                    ‹
                                </button>
                                <span className={styles.calendarMonthTitle}>
                                    {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                                </span>
                                <button
                                    className={styles.navArrowBtn}
                                    onClick={handleNextMonth}
                                    title="Next Month"
                                >
                                    ›
                                </button>
                            </div>

                            <div className={styles.calendarGrid}>
                                <span className={styles.dayOfWeek}>Mo</span>
                                <span className={styles.dayOfWeek}>Tu</span>
                                <span className={styles.dayOfWeek}>We</span>
                                <span className={styles.dayOfWeek}>Th</span>
                                <span className={styles.dayOfWeek}>Fr</span>
                                <span className={styles.dayOfWeek}>Sa</span>
                                <span className={styles.dayOfWeek}>Su</span>

                                {calendarDays.map((day) => {
                                    if (day.empty) {
                                        return <div key={day.key} className={`${styles.dayCell} ${styles.emptyCell}`} />;
                                    }

                                    const isStart = checkIn === day.dateStr;
                                    const isEnd = checkOut === day.dateStr;
                                    const isInRange = checkIn && checkOut && day.dateStr > checkIn && day.dateStr < checkOut;

                                    let cellClasses = styles.dayCell;
                                    if (day.isBooked) cellClasses += ` ${styles.bookedDay}`;
                                    else if (day.isDisabled) cellClasses += ` ${styles.disabled}`;
                                    if (isStart) cellClasses += ` ${styles.selectedStart}`;
                                    if (isEnd) cellClasses += ` ${styles.selectedEnd}`;
                                    if (isInRange) cellClasses += ` ${styles.inRange}`;

                                    return (
                                        <div
                                            key={day.key}
                                            className={cellClasses}
                                            onClick={() => handleDayClick(day)}
                                            title={day.isBooked ? 'Already Reserved (Unavailable)' : day.dateStr}
                                        >
                                            {day.dayNumber}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.legend}>
                                <div className={styles.legendItem}>
                                    <span className={`${styles.legendDot} ${styles.dotAvailable}`} />
                                    <span>Available</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <span className={`${styles.legendDot} ${styles.dotSelected}`} />
                                    <span>Selected</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <span className={`${styles.legendDot} ${styles.dotBooked}`} />
                                    <span>Reserved</span>
                                </div>
                            </div>
                        </div>

                        {/* Booking Summary Box */}
                        <div className={styles.summaryBox}>
                            <div className={styles.summaryRow}>
                                <span>Check-in:</span>
                                <strong>{checkIn || '—'}</strong>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Check-out:</span>
                                <strong>{checkOut || '—'}</strong>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Duration:</span>
                                <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                <span>Total:</span>
                                <span className={styles.totalAmount}>${totalPrice}</span>
                            </div>
                        </div>

                        <button
                            className={styles.bookButton}
                            onClick={handleBookReservation}
                            disabled={!checkIn || !checkOut || bookingLoading}
                        >
                            {bookingLoading ? 'Reserving...' : (checkIn && checkOut ? 'Confirm Reservation' : 'Select Dates to Book')}
                        </button>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default RoomDetails;
