// Controller updates
const agreementModel = require('../../models/convention_models/agreement.model');

const addAgreement = async (req, res) => {
    try {
        const contractId = req.params.contractId;
        const { description, title } = req.body;
        
        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }
        
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        
        const newAgreement = await agreementModel.createAgreement(contractId, description, title);
        res.status(201).json({ message: "Agreement added successfully", agreement: newAgreement });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAgreement = async (req, res) => {
    try {
        const agreementId = req.params.agreementId;
        const deleted = await agreementModel.deleteAgreement(agreementId);
        if (!deleted) {
            return res.status(404).json({ message: "Agreement not found" });
        }
        res.json({ message: "Agreement deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAgreementsByContractId = async (req, res) => {
    try {
        const contractId = req.params.contractId;
        const agreements = await agreementModel.getAgreementsByContractId(contractId);
        res.status(200).json(agreements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAgreement = async (req, res) => {
    try {
        const agreementId = req.params.agreementId;
        const { description, title } = req.body;
        
        if (!description) {
            return res.status(400).json({ message: "Description is required to update" });
        }
        
        if (!title) {
            return res.status(400).json({ message: "Title is required to update" });
        }
        
        const updatedAgreement = await agreementModel.updateAgreement(agreementId, description, title);
        if (!updatedAgreement) {
            return res.status(404).json({ message: "Agreement not found" });
        }
        res.json({ message: "Agreement updated successfully", agreement: updatedAgreement });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAgreementById = async (req, res) => {
    try {
        const agreementId = req.params.agreementId;
        const agreement = await agreementModel.getAgreementById(agreementId);
        if (!agreement) {
            return res.status(404).json({ message: "Agreement not found" });
        }
        res.json(agreement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addAgreement,
    deleteAgreement,
    updateAgreement,
    getAgreementById,
    getAgreementsByContractId
};