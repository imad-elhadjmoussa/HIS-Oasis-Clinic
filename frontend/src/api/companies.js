import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const companiesApi = axios.create({
    baseURL: `${SERVER_URL}/api/companies`,
    headers: {
        'Content-Type': 'application/json'
    }
});


export const getCompanies = async () => {
    try {
        const response = await companiesApi.get('/');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch companies');
    }
}