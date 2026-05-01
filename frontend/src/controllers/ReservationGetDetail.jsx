import React, { useState } from 'react';
import axios from 'axios';

function ReservationGetDetail() {
    const [reservation, setReservation] = useState(null);
    const [error, setError] = useState('');

    const fetchReservation = async (id) => {
        try {

            const response = await axios.get(`http://localhost:8080/reservation/${id}`);

            setReservation(response.data);
            setError('');
        } catch (err) {
            console.error("Ошибка при получении брони:", err);
            setError('Бронирование не найдено или произошла ошибка сервера');
            setReservation(null);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Поиск бронирования</h2>
            <button onClick={() => fetchReservation(1)}>Загрузить бронь №1</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {reservation && (
                <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
                    <h3>Детали бронирования:</h3>
                    <p>ID: {reservation.id}</p>
                    <p>UserId: {reservation.userId}</p>
                    <p>StartDate: {reservation.startDate}</p>
                    <p>EndDate: {reservation.endDate}</p>
                    <p>Status: {reservation.status}</p>
                </div>
            )}
        </div>
    );
}

export default ReservationGetDetail;
