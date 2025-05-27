const companyModel = require('../models/company.model');

const getAllCompanies = async (req, res) => {
    try {
        const companies = await companyModel.getAllCompanies();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    
};

const createCompany = async (req, res) => {
    try {
        const { company_name, address, phone_number, email } = req.body;

        // 1. Check for required fields
        if (!company_name || !phone_number || !email) {
            return res.status(400).json({ message: "company_name, phone_number and email are required" });
        }

        // 2. Validate phone number (basic length check)
        if (phone_number.length !== 10 || !/^\d+$/.test(phone_number)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

        // 3. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // 4. Create company
        const newCompany = await companyModel.createCompany(req.body);
        res.status(201).json({ message: "Company created successfully", company: newCompany });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCompany = async (req, res) => {
    try {
        const id = req.params.id;
        const { company_name, address, phone_number, email } = req.body;

        // 1. Validate input
        if (!company_name && !address && !phone_number && !email) {
            return res.status(400).json({ message: "At least one field is required to update" });
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
        }

        if (phone_number && (phone_number.length !== 10 || !/^\d+$/.test(phone_number))) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

        // 2. Update company
        const updatedCompany = await companyModel.updateCompany(id, req.body);
        if (!updatedCompany) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.json({ message: "Company updated successfully", company: updatedCompany });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getAllCompanies,
    createCompany,
    updateCompany
};
