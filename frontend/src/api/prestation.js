import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const prestationApi = axios.create({
    baseURL: `${SERVER_URL}/api/prestations`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getPrestations = async () => {
    try {
        const response = await prestationApi.get('/');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch prestations');
    }
}

export const createPrestation = async (prestationData) => {
    try {
        const response = await prestationApi.post('/', prestationData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create prestation');
    }
}

export const updatePrestation = async (prestationId, prestationData) => {
    try {
        const response = await prestationApi.put(`/${prestationId}`, prestationData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to update prestation ${prestationId}`);
    }
}

export const deletePrestation = async (prestationId) => {
    try {
        const response = await prestationApi.delete(`/${prestationId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to delete prestation ${prestationId}`);
    }
}