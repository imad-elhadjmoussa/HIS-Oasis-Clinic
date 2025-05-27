import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const doctorApi = axios.create({
    baseURL: `${SERVER_URL}/api/doctors`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getDoctorById = async (doctorId) => {
    try {
        const response = await doctorApi.get(`/${doctorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching doctor by ID:', error);
        throw error;
    }
}

export const getDoctors = async () => {
    try {
        const response = await doctorApi.get('/');
        return response.data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
}

export const createDoctor = async (doctorData) => {
    try {
        const response = await doctorApi.post('/', doctorData);
        return response.data;
    } catch (error) {
        console.error('Error creating doctor:', error);
        throw error;
    }
}

export const updateDoctor = async (doctorId, doctorData) => {
    try {
        const response = await doctorApi.put(`/${doctorId}`, doctorData);
        return response.data;
    } catch (error) {
        console.error('Error updating doctor:', error);
        throw error;
    }
}

export const deleteDoctor = async (doctorId) => {
    try {
        const response = await doctorApi.delete(`/${doctorId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting doctor:', error);
        throw error;
    }
}