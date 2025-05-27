import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const authApi = axios.create({
    baseURL: `${SERVER_URL}/api/auth`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const login = async (email, password) => {
    try {
        const response = await authApi.post('/login', { email, password },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
}


export const logoutUser = async () => {
    try {
        const response = await authApi.post('/logout', {}, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Logout failed');
    }
}


