import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ficheApi = axios.create({
    baseURL: `${SERVER_URL}/api/medical-records`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getMedicalRecords = async () => {
    try {
        const response = await ficheApi.get('/');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch fiches');
    }
}

export const getMedicalRecord = async (id) => {
    try {
        const response = await ficheApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch fiche');
    }
};

export const createFiche = async (data) => {
    try {

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        let payload = data;

        // Convert to FormData only if needed
        const formData = new FormData();
        formData.append('patient_id', data.patient_id);
        formData.append('company_id', data.company_id);
        formData.append('contract_id', data.contract_id);
        formData.append('prise_en_charge_date', data.prise_en_charge_date);
        formData.append('prise_en_charge_image', data.prise_en_charge_image);
        payload = formData;

        const response = await ficheApi.post('/', payload, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create fiche');
    }
};


export const updateMedicalRecord = async (id, medicalRecord) => {
    try {
        const response = await ficheApi.patch(`/${id}`, medicalRecord);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update fiche');
    }
}

export const deleteMedicalRecord = async (id) => {
    try {
        const response = await ficheApi.delete(`/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete fiche');
    }
}