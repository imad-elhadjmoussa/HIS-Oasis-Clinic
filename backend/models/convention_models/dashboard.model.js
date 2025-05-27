const db = require('../../db/connection');

// Get total number of companies
const getTotalCompanies = async () => {
    const query = `
        SELECT COUNT(*) as total
        FROM Company
    `;
    const [rows] = await db.execute(query);
    return rows[0];
};

// Get contract statistics by status
const getContractStats = async () => {
    const query = `
        SELECT 
            status,
            COUNT(*) as count
        FROM Contract
        GROUP BY status
    `;
    const [rows] = await db.execute(query);
    
    // Convert to object for easier access
    const stats = {
        active: 0,
        pending: 0,
        expired: 0
    };
    
    rows.forEach(row => {
        stats[row.status.toLowerCase()] = row.count;
    });
    
    return stats;
};

// Get recent contracts with company information
const getRecentContracts = async (limit = 10) => {
    const query = `
        SELECT 
            Contract.id,
            Contract.contract_name,
            Contract.status,
            Company.company_name,
            AgreementDetails.created_at
        FROM Contract
        JOIN Company ON Contract.company_id = Company.id
        LEFT JOIN AgreementDetails ON Contract.id = AgreementDetails.contract_id
        WHERE AgreementDetails.head = 'yes'
        ORDER BY AgreementDetails.created_at DESC
        LIMIT ${parseInt(limit)}
    `;
    const [rows] = await db.execute(query);
    return rows;
};

// Get top companies by contract count
const getTopCompanies = async (limit = 10) => {
    const query = `
        SELECT 
            Company.id,
            Company.company_name,
            Company.is_public,
            COUNT(Contract.id) as contract_count
        FROM Company
        LEFT JOIN Contract ON Company.id = Contract.company_id
        GROUP BY Company.id, Company.company_name, Company.is_public
        ORDER BY contract_count DESC
        LIMIT ${parseInt(limit)}
    `;
    const [rows] = await db.execute(query);
    return rows;
};

// Get specialty statistics with annex and prestation counts
const getSpecialtyStats = async () => {
    const query = `
        SELECT 
            Specialty.id,
            Specialty.specialty_name,
            Specialty.description,
            COUNT(DISTINCT Annex.id) as annex_count,
            COUNT(DISTINCT PrestationList.id) as prestation_count
        FROM Specialty
        LEFT JOIN Annex ON Specialty.id = Annex.specialty_id
        LEFT JOIN PrestationList ON Specialty.id = PrestationList.specialty_id
        GROUP BY Specialty.id, Specialty.specialty_name, Specialty.description
        ORDER BY prestation_count DESC, annex_count DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
};

// Get monthly contract creation data for the last N months
const getMonthlyContractData = async (months = 12) => {
    const query = `
        SELECT 
            DATE_FORMAT(AgreementDetails.created_at, '%Y-%m') as month,
            COUNT(DISTINCT Contract.id) as count
        FROM Contract
        LEFT JOIN AgreementDetails ON Contract.id = AgreementDetails.contract_id
        WHERE AgreementDetails.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL ${parseInt(months)} MONTH)
            AND AgreementDetails.head = 'yes'
        GROUP BY DATE_FORMAT(AgreementDetails.created_at, '%Y-%m')
        ORDER BY month ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
};

// Get contracts expiring soon based on agreement details
const getExpiringContracts = async (days = 30) => {
    const query = `
        SELECT DISTINCT
            Contract.id,
            Contract.contract_name,
            Contract.status,
            Company.company_name,
            AgreementDetails.end_date,
            DATEDIFF(AgreementDetails.end_date, CURRENT_DATE) as days_until_expiry
        FROM Contract
        JOIN Company ON Contract.company_id = Company.id
        JOIN AgreementDetails ON Contract.id = AgreementDetails.contract_id
        WHERE AgreementDetails.end_date IS NOT NULL 
            AND AgreementDetails.end_date >= CURRENT_DATE
            AND AgreementDetails.end_date <= DATE_ADD(CURRENT_DATE, INTERVAL ${parseInt(days)} DAY)
            AND AgreementDetails.updated_by_id IS NULL
        ORDER BY AgreementDetails.end_date ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
};

// Get count of active avenants
const getActiveAvenantsCount = async () => {
    const query = `
        SELECT 
            COUNT(*) as total,
            status,
            COUNT(CASE WHEN head = 'yes' THEN 1 END) as head_count
        FROM Avenant
        WHERE status = 'Active'
        GROUP BY status
    `;
    const [rows] = await db.execute(query);
    return rows[0] || { total: 0, status: 'Active', head_count: 0 };
};

// Get prestation price analytics
const getPrestationPriceAnalytics = async () => {
    const query = `
        SELECT 
            COUNT(*) as total_prestations,
            AVG(PrestationPrice.price) as avg_price,
            MIN(PrestationPrice.price) as min_price,
            MAX(PrestationPrice.price) as max_price,
            AVG(PrestationPrice.patient_part) as avg_patient_part,
            COUNT(CASE WHEN PrestationPrice.avenant_id IS NOT NULL THEN 1 END) as modified_by_avenant,
            COUNT(CASE WHEN PrestationPrice.head = 'yes' THEN 1 END) as current_versions
        FROM PrestationPrice
        LEFT JOIN Avenant ON PrestationPrice.avenant_id = Avenant.id
        LEFT JOIN Contract ON PrestationPrice.annex_id IN (
            SELECT Annex.id FROM Annex WHERE Annex.contract_id = Contract.id
        )
        WHERE PrestationPrice.updated_by_id IS NULL
            AND (
                (PrestationPrice.avenant_id IS NOT NULL AND Avenant.status = 'Active') 
                OR 
                (PrestationPrice.avenant_id IS NULL AND Contract.status = 'Active')
            )
    `;
    const [rows] = await db.execute(query);
    return rows[0];
};

// Get contract distribution by company type (public vs private)
const getContractDistributionByCompanyType = async () => {
    const query = `
        SELECT 
            COUNT(Contract.id) as contract_count,
            Contract.status
        FROM Company
        JOIN Contract ON Company.id = Contract.company_id
        GROUP BY Contract.status
        ORDER BY Contract.status
    `;
    const [rows] = await db.execute(query);
    return rows;
};

// Get most active specialties (by prestation count)
const getMostActiveSpecialties = async (limit = 5) => {
    const query = `
        SELECT 
            Specialty.specialty_name,
            Specialty.description,
            COUNT(PrestationPrice.id) as active_prestations
        FROM Specialty
        JOIN PrestationList ON Specialty.id = PrestationList.specialty_id
        JOIN PrestationPrice ON PrestationList.id = PrestationPrice.prestation_list_id
        LEFT JOIN Avenant ON PrestationPrice.avenant_id = Avenant.id
        LEFT JOIN Contract ON PrestationPrice.annex_id IN (
            SELECT Annex.id FROM Annex WHERE Annex.contract_id = Contract.id
        )
        WHERE PrestationPrice.updated_by_id IS NULL
            AND (
                (PrestationPrice.avenant_id IS NOT NULL AND Avenant.status = 'Active') 
                OR 
                (PrestationPrice.avenant_id IS NULL AND Contract.status = 'Active')
            )
        GROUP BY Specialty.id, Specialty.specialty_name, Specialty.description
        ORDER BY active_prestations DESC
        LIMIT ${parseInt(limit)}
    `;
    const [rows] = await db.execute(query);
    return rows;
};

// Get recent avenants activity
const getRecentAvenantsActivity = async (limit = 10) => {
    const query = `
        SELECT 
            Avenant.id,
            Avenant.status,
            Avenant.created_at,
            Avenant.activate_at,
            Contract.contract_name,
            Company.company_name
        FROM Avenant
        JOIN Contract ON Avenant.contract_id = Contract.id
        JOIN Company ON Contract.company_id = Company.id
        ORDER BY Avenant.created_at DESC
        LIMIT ${parseInt(limit)}
    `;
    const [rows] = await db.execute(query);
    return rows;
};

module.exports = {
    getTotalCompanies,
    getContractStats,
    getRecentContracts,
    getTopCompanies,
    getSpecialtyStats,
    getMonthlyContractData,
    getExpiringContracts,
    getActiveAvenantsCount,
    getPrestationPriceAnalytics,
    getContractDistributionByCompanyType,
    getMostActiveSpecialties,
    getRecentAvenantsActivity
};