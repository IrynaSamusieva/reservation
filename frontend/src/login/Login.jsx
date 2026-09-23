import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
const TARGET_PAGE = '/reservation';

function Login({ onLoginSuccess }) {
    const navigate = useNavigate();
    const [mode, setMode] = useState('signup');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const API_BASE = import.meta.env.VITE_API_BASE;
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            let authData;

            if (mode === 'signup') {
                // 1. Создаем аккаунт
                await axios.post(`${API_BASE}/auth/signup`, formData);

                // 2. Сразу выполняем авто-вход, чтобы получить JWT-токен
                const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
                    email: formData.email,
                    password: formData.password
                });
                authData = loginResponse.data;
            } else {
                // Обычный вход
                const response = await axios.post(`${API_BASE}/auth/login`, {
                    email: formData.email,
                    password: formData.password
                });
                authData = response.data;
            }

            // Сохраняем токен авторизации
            localStorage.setItem('accessToken', authData.token);

            // Сообщаем App.jsx об успешном входе (isAuthenticated станет true)
            onLoginSuccess?.(authData);

            // Перенаправляем на страницу бронирования
            navigate(TARGET_PAGE);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Oops! An error occurred";
            setMessage(errorMsg);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.title}>
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>

            {mode === 'signup' && (
                <>
                    <label className={styles.label} htmlFor="username">Username</label>
                    <input
                        id="username"
                        className={styles.input}
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required={mode === 'signup'}
                    />
                </>
            )}

            <label className={styles.label} htmlFor="email">Email</label>
            <input
                id="email"
                className={styles.input}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />

            <label className={styles.label} htmlFor="password">Password</label>
            <input
                id="password"
                className={styles.input}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
            />

            <button className={styles.button} type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : (mode === 'signup' ? 'Register' : 'Login')}
            </button>

            <p className={styles.switch}>
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                    type="button"
                    className={styles.link}
                    onClick={() => {
                        setMode(mode === 'signup' ? 'login' : 'signup');
                        setMessage('');
                        setFormData({ username: '', email: formData.email, password: '' });
                    }}
                >
                    {mode === 'signup' ? 'Log in' : 'Sign up'}
                </button>
            </p>

            {message && (
                <div className={`${styles.message} ${message.includes('successful') ? styles.success : styles.error}`}>
                    {message}
                </div>
            )}
        </form>
    );
}

export default Login;
