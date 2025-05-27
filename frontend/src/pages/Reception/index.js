export const showNotification = (toast, message, severity = 'success') => {
    toast.add({
        severity,  // 'success', 'info', 'warn', 'error'
        summary: severity.charAt(0).toUpperCase() + severity.slice(1),
        detail: message,
        life: 3000, // Auto-close after 3 seconds
    });
};

export const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Pending', value: 'Pending' },
];

export const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const genders = ['male', 'female'];

export const statusSeverity = (status) => {
    switch (status) {
        case 'Active': return 'success';
        case 'Inactive': return 'danger';
        case 'Pending': return 'warning';
        default: return 'info';
    }
};
export const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Get day, month, and full year components
    const day = String(date.getDate()).padStart(2, '0');  // Ensure two digits
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed
    const year = date.getFullYear();  // Get full 4-digit year

    return `${day}/${month}/${year}`;
};


export const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};




export const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
}

export const agreementStatus = (validUntil) => {
    return new Date(validUntil) > new Date() ? 'Active' : 'Expired'
}

export const agreementSeverity = (validUntil) => {
    return new Date(validUntil) > new Date() ? 'success' : 'danger'
}