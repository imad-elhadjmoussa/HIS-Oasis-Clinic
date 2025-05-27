const specialtyModel = require('../../models/convention_models/specialty.model');

// GET all specialties
const getAllSpecialties = async (req, res) => {
    const { contractId } = req.params;
    try {
        const specialties = await specialtyModel.getAllSpecialties(contractId);
        res.json(specialties);
    } catch (error) {
        console.error('Error fetching specialties:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllSpecialties,
};
