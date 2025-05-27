const db = require("./../../db/connection");

const getAllCompanies = async () => {
    const [rows] = await db.query('SELECT * FROM Company ORDER BY id DESC');
    return rows;
};

const createCompany = async (company) => {
    const query = `
        INSERT INTO Company (company_name, address, phone_number, email, is_public)
        VALUES (?, ?, ?, ?, 'no')
    `;
    const values = [company.company_name, company.address, company.phone_number, company.email];

    try {
        const [result] = await db.query(query, values);
        return {
            ...company,
            id: result.insertId
        };
    } catch (error) {
        console.error("Error inserting company:", error);
        throw error;
    }
};

const createPublicCompanyWithGeneralContract = async (company) => {
    // Start transaction
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Create the public company
        const companyQuery = `
            INSERT INTO Company (company_name, address, phone_number, email, is_public)
            VALUES (?, ?, ?, ?, 'yes')
        `;
        const companyValues = [company.company_name, company.address, company.phone_number, company.email];
        const [companyResult] = await connection.query(companyQuery, companyValues);
        const companyId = companyResult.insertId;
        
        // 2. Create the general contract
        const contractQuery = `
            INSERT INTO Contract (contract_name, status, company_id, is_general)
            VALUES ('General Contract', 'Pending', ?, 'yes')
        `;
        const [contractResult] = await connection.query(contractQuery, [companyId]);
        const contractId = contractResult.insertId;
        
        // 3. Create agreement details
        const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const agreementQuery = `
            INSERT INTO AgreementDetails (
                start_date, end_date, family_auth, max_price, min_price, 
                discount_percentage, contract_id, head, created_at
            ) VALUES (?, NULL, 'ascendant,descendant,Conjoint,adherent,autre', NULL, NULL, 0, ?, 'yes', NOW())
        `;
        await connection.query(agreementQuery, [currentDate, contractId]);
        
        // 4. Get all specialties and create annexes for each
        const [specialties] = await connection.query('SELECT * FROM Specialty');
        
        for (const specialty of specialties) {
            // Create annex
            const annexQuery = `
                INSERT INTO Annex (annex_name, contract_id, specialty_id, created_at, created_by)
                VALUES (?, ?, ?, NOW(), 'manual')
            `;
            const annexName = `Annex ${specialty.specialty_name}`;
            const [annexResult] = await connection.query(annexQuery, [annexName, contractId, specialty.id]);
            const annexId = annexResult.insertId;
            
            // Get all prestations for this specialty and create prestation prices
            const [prestations] = await connection.query(
                'SELECT * FROM PrestationList WHERE specialty_id = ?', 
                [specialty.id]
            );
            
            for (const prestation of prestations) {
                const prestationPriceQuery = `
                    INSERT INTO PrestationPrice (
                        price, patient_part, annex_id, prestation_list_id, 
                        head, created_at, activate_at
                    ) VALUES (0, 0, ?, ?, 'yes', NOW(), NULL)
                `;
                await connection.query(prestationPriceQuery, [annexId, prestation.id]);
            }
        }
        
        // Commit transaction
        await connection.commit();
        
        return {
            ...company,
            id: companyId,
            is_public: 'yes'
        };
    } catch (error) {
        await connection.rollback();
        console.error("Error creating public company with general contract:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const updateCompany = async (id, company) => {
    const query = `
        UPDATE Company
        SET company_name = ?, address = ?, phone_number = ?, email = ?
        WHERE id = ?
    `;
    const values = [company.company_name, company.address, company.phone_number, company.email, id];

    try {
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Company not found or no changes made.");
        }

        return { ...company, id };
    } catch (error) {
        console.error("Error updating company:", error);
        throw error;
    }
};


const getCompanyById = async (id) => {
    const [rows] = await db.query('SELECT * FROM Company WHERE id = ?', [id]);
    return rows[0]; // Return single company or undefined if not found
};

const isFirstCompany = async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM Company');
    return rows[0].count === 0;
};

module.exports = {
    getAllCompanies,
    createCompany,
    updateCompany,
    getCompanyById,
    createPublicCompanyWithGeneralContract,
    isFirstCompany
};
