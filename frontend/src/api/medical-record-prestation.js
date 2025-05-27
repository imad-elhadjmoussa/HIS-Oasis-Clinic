import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ficheApi = axios.create({
    baseURL: `${SERVER_URL}/api/medical-record-prestations`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getPrestationsMedicalRecord=async(id)=>{
    try {
        const response = await ficheApi.get(`/medicalRecord/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch fiche');
    }
}

export const createMedicalRecordPrestation=async(data)=>{
    try {
        const response = await ficheApi.post('/', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create fiche');
    }
}

export const deletePrestationMedicalRecord=async(id)=>{
    try {
        const response = await ficheApi.delete(`/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete fiche');
    }
}
