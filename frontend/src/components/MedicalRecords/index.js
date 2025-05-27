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
export const genders = ['MALE', 'FEMALE'];

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



// Company Table
export const companies = [
    {
        company_name: 'ABC Corporation',
        address: '123 Business Ave, Cityville',
        phone_number: '1234567890',
        email: 'contact@abccorp.com'
    },
    {
        company_name: 'XYZ Enterprises',
        address: '456 Commerce St, Townsville',
        phone_number: '2345678901',
        email: 'info@xyzenter.com'
    },
    {
        company_name: 'HealthPlus Inc',
        address: '789 Wellness Blvd, Medcity',
        phone_number: '3456789012',
        email: 'support@healthplus.com'
    },
    {
        company_name: 'Global Industries',
        address: '321 World St, Metropolis',
        phone_number: '4567890123',
        email: 'contact@globalind.com'
    },
    {
        company_name: 'Prime Services',
        address: '654 Quality Rd, Servicetown',
        phone_number: '5678901234',
        email: 'hello@primeserv.com'
    }
];

// Agreement Table
export const agreements = [
    {
        description: 'Comprehensive health coverage for all employees',
        contract_id: 1
    },
    {
        description: 'Standard medical benefits package',
        contract_id: 2
    },
    {
        description: 'Premium healthcare services agreement',
        contract_id: 3
    },
    {
        description: 'Temporary coverage contract',
        contract_id: 4
    },
    {
        description: 'Executive medical services package',
        contract_id: 5
    }
];

// Annex Table
export const annexes = [
    {
        annex_name: 'ABC General Medicine Addendum',
        contract_id: 1,
        specialty_id: 1
    },
    {
        annex_name: 'XYZ Cardiology Coverage',
        contract_id: 2,
        specialty_id: 2
    },
    {
        annex_name: 'HealthPlus Dermatology',
        contract_id: 3,
        specialty_id: 3
    },
    {
        annex_name: 'Global Pediatrics',
        contract_id: 4,
        specialty_id: 4
    },
    {
        annex_name: 'Prime Orthopedics',
        contract_id: 5,
        specialty_id: 5
    }
];

// Specialty Table
export const specialties = [
    { specialty_name: 'General Medicine' },
    { specialty_name: 'Cardiology' },
    { specialty_name: 'Dermatology' },
    { specialty_name: 'Pediatrics' },
    { specialty_name: 'Orthopedics' },
    { specialty_name: 'Ophthalmology' },
    { specialty_name: 'Neurology' }
];


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