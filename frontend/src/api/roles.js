const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const getRoles = async () => {
    const response = await fetch(`${SERVER_URL}/api/roles`);
    if (!response.ok) {
        throw new Error('Failed to fetch roles');
    }
    const data = await response.json();
    return data;
}

export const createRole = async (role) => {
    const response = await fetch(`${SERVER_URL}/api/roles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(role) 
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create role');
    }
    return data;
};