import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const patientApi = axios.create({
    baseURL: `${SERVER_URL}/api/patients`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getPatients = async () => {
    try {
        const response = await patientApi.get('/');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch patients');
    }
};

export const getPatient = async (id) => {
    try {
        const response = await patientApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch patient');
    }
};

export const createPatient = async (patient) => {
    try {
        const response = await patientApi.post('/', patient);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create patient');
    }
};

export const updatePatient = async (id, patient) => {
    try {
        const response = await patientApi.put(`/${id}`, patient);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update patient');
    }
};

export const deletePatient = async (id) => {
    try {
        const response = await patientApi.delete(`/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete patient');
    }
};

export const getPatientMedicalRecords = async (id) => {
    try {
        const response = await patientApi.get(`/${id}/medical-records`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch medical records');
    }
}

export function validatePatient(patient) {
    if (!patient.national_id_number ||
        !patient.first_name ||
        !patient.last_name ||
        !patient.date_of_birth ||
        !patient.phone_number) {
        throw new Error('Please fill all required fields');
    }

    // Validate Email (strict but common pattern)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(patient.email || '')) {
        throw new Error("Invalid Email address");
    }

    // Additional email validation - check TLD length (2-6 chars)
    const emailParts = patient.email.split('@');
    if (emailParts.length !== 2) {
        throw new Error("Invalid Email address (missing domain)");
    }
    const domainParts = emailParts[1].split('.');
    if (domainParts.length < 2 ||
        domainParts[domainParts.length - 1].length < 2 ||
        domainParts[domainParts.length - 1].length > 6) {
        throw new Error("Invalid Email address (invalid TLD)");
    }
}


