// src/api/modalityApi.js
import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const modalityApi = axios.create({
    baseURL: `${SERVER_URL}/api/modalities`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getModalities = async () => {
    try {
        const response = await modalityApi.get('/');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch modalities');
    }
};

export const createModality = async (modalityData) => {
    try {
        const response = await modalityApi.post('/', modalityData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create modality');
    }
};

export const updateModality = async (modalityId, modalityData) => {
    try {
        const response = await modalityApi.put(`/${modalityId}`, modalityData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to update modality ${modalityId}`);
    }
};

export const deleteModality = async (modalityId) => {
    try {
        const response = await modalityApi.delete(`/${modalityId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to delete modality ${modalityId}`);
    }
};

export const getModalityDetails = async (modalityId) => {
    try {
        const response = await modalityApi.get(`/${modalityId}/details`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to fetch details for modality ${modalityId}`);
    }
};
