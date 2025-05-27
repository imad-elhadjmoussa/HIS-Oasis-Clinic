import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const contractApi = axios.create({
    baseURL: `${SERVER_URL}/api/contracts`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getContractDetails = async (contractId) => {
    try {
        const response = await contractApi.get(`/${contractId}/details`);
        return response.data;
    } catch (error) {
        console.error('Error fetching contract details:', error);
        throw error;
    }
}

export const getCompanyContracts = async (companyId, queryParams = {}) => {
    try {
        const response = await contractApi.get(`/company/${companyId}`, {
            params: queryParams
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching company contracts:', error);
        throw error;
    }
};

export const getAllContracts = async () => {
    try {
        const response = await contractApi.get(`/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching contract details:', error);
        throw error;
    }
}