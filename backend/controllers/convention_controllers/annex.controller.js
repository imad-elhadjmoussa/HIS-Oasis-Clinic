const annexModel = require('../../models/convention_models/annex.model');


// Create a new annex
const createAnnex = async (req, res) => {
    try {
        const contractId = req.params.contractId;
        const annexData = req.body;

        const newAnnex = await annexModel.createAnnex(contractId, annexData);
        res.status(201).json(newAnnex);
    } catch (error) {
        console.error('Error creating annex:', error);
        res.status(500).json({ message: 'Failed to create annex' });
    }
};

// Update an annex by ID
const updateAnnex = async (req, res) => {
    try {
        const annexId = req.params.annexId;
        const updateData = req.body;

        const updated = await annexModel.updateAnnex(annexId, updateData);
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating annex:', error);
        res.status(500).json({ message: 'Failed to update annex' });
    }
};

// Get annexes by contract ID
const getAnnexesByContract = async (req, res) => {
    try {
        const contractId = req.params.contractId;

        const annexes = await annexModel.getAnnexesByContractId(contractId);
        res.status(200).json(annexes);
    } catch (error) {
        console.error('Error fetching annexes:', error);
        res.status(500).json({ message: 'Failed to fetch annexes' });
    }
};

// Get a specific annex by its ID
const getAnnexById = async (req, res) => {
    try {
        const annexId = req.params.annexId;

        const annex = await annexModel.getAnnexById(annexId);
        if (!annex) {
            return res.status(404).json({ message: 'Annex not found' });
        }

        res.status(200).json(annex);
    } catch (error) {
        console.error('Error fetching annex:', error);
        res.status(500).json({ message: 'Failed to fetch annex' });
    }
};

const hasPrestationsUnderAnnex = async (req, res) => {
    try {
        const annexId = req.params.annexId;

        const hasPrestations = await annexModel.hasPrestationsUnderAnnex(annexId);
        res.status(200).json({ hasPrestations });
    } catch (error) {
        console.error('Error checking prestations under annex:', error);
        res.status(500).json({ message: 'Failed to check prestations' });
    }
};

// Controller for delete annex operation
const deleteAnnex = async (req, res) => {
    try {
        const annexId = req.params.annexId;
        
        // Call the model function to delete the annex
        const result = await annexModel.deleteAnnex(annexId);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Annex not found' });
        }
        
        res.status(200).json({ message: 'Annex deleted successfully' });
    } catch (error) {
        console.error('Error deleting annex:', error);
        res.status(500).json({ message: 'Failed to delete annex' });
    }
};


module.exports = {
    createAnnex,
    updateAnnex,
    getAnnexesByContract,
    getAnnexById,
    hasPrestationsUnderAnnex,
    deleteAnnex
};