import React, { useState } from 'react';
import axios from 'axios';

function RegisterForm() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    // Состояние загрузки: по умолчанию false
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true); // 1. Включаем спиннер
        setMessage('');     // Очищаем старые сообщения

        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', formData);
            setMessage("Успех!");
        } catch (error) {
            setMessage("Ошибка!");
        } finally {
            setIsLoading(false); // 2. Выключаем спиннер в любом случае (успех или ошибка)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* ... твои инпуты ... */}

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>

            {/* Если isLoading === true, показываем спиннер */}
            {isLoading && <div className="spinner"></div>}
        </form>
    );
}
