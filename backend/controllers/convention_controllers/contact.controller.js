const contactModel = require('../../models/convention_models/contact.model');

const getContactsByCompanyId = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const contacts = await contactModel.getContactsByCompanyId(companyId);
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addContactToCompany = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const { phone_number, Name, email, job_function } = req.body;
        
        if (!phone_number || !Name || !email) {
            return res.status(400).json({ message: "phone_number, Name, and email are required" });
        }
        
        if (phone_number.length !== 10 || !/^\d+$/.test(phone_number)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        
        const newContact = await contactModel.addContactToCompany(companyId, { 
            phone_number, 
            Name, 
            email,
            job_function 
        });
        
        res.status(201).json({ message: "Contact added successfully", contact: newContact });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateContact = async (req, res) => {
    try {
        const contactId = req.params.contactId;
        const { phone_number, Name, email, job_function } = req.body;
        
        if (!phone_number && !Name && !email && job_function === undefined) {
            return res.status(400).json({ message: "At least one field is required to update" });
        }
        
        if (phone_number && (phone_number.length !== 10 || !/^\d+$/.test(phone_number))) {
            return res.status(400).json({ message: "Invalid phone number" });
        }
        
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
        }
        
        const updatedContact = await contactModel.updateContact(contactId, { 
            phone_number, 
            Name, 
            email,
            job_function 
        });
        
        if (!updatedContact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        
        res.json({ message: "Contact updated successfully", contact: updatedContact });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteContact = async (req, res) => {
    try {
        const contactId = req.params.contactId;
        const result = await contactModel.deleteContact(contactId);
        
        if (!result) {
            return res.status(404).json({ message: "Contact not found" });
        }
        
        res.json({ message: "Contact deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getContactsByCompanyId,
    addContactToCompany,
    updateContact,
    deleteContact
};