const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const getUsers = async () => {
    const response = await fetch(`${SERVER_URL}/api/users`);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    const data = await response.json();
    return data;
}

export const getUser = async (id) => {
    const response = await fetch(`${SERVER_URL}/users/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }
    const data = await response.json();
    return data;
}

export const createUser = async (user) => {
    const response = await fetch(`${SERVER_URL}/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user) 
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
    }
    return data;
};

export const updateUser = async (id, user) => {
    const response = await fetch(`${SERVER_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
    }
    return data;
}

export const deleteUser = async (id) => {
    const response = await fetch(`${SERVER_URL}/users/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
    const data = await response.json();
    return data;
}

