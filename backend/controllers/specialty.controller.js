
const specialtyModel = require('../models/specialty.model');

const getSpecialties = async (req, res) => {
    try {
        const specialties = await specialtyModel.getSpecialties();
        res.status(200).json(specialties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const createSpecialty = async (req, res) => {
    try {
        const newSpecialty = await specialtyModel.createSpecialty(req.body);
        res.status(201).json({
            specialty: newSpecialty,
            message: 'Specialty created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}

const updateSpecialty = async (req, res) => {
    const specialtyId = req.params.id;
    try {
        const updatedSpecialty = await specialtyModel.updateSpecialty(specialtyId, req.body);
        if (!updatedSpecialty) {
            return res.status(404).json({ message: 'Specialty not found' });
        }
        res.status(200).json(
            {
                specialty: updatedSpecialty,
                message: 'Specialty updated successfully'
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}

const deleteSpecialty = async (req, res) => {
    const specialtyId = req.params.id;
    try {
        const deletedSpecialty = await specialtyModel.deleteSpecialty(specialtyId);
        if (!deletedSpecialty) {
            return res.status(404).json({ message: 'Specialty not found' });
        }
        res.status(200).json({ message: 'Specialty deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}

const getSpecialtyDetails = async (req, res) => {
    const specialtyId = req.params.specialtyId;
    try {
        const specialtyDetails = await specialtyModel.getSpecialtyDetails(specialtyId);
        if (!specialtyDetails) {
            return res.status(404).json({ message: 'Specialty not found' });
        }
        res.status(200).json(specialtyDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getSpecialties,
    getSpecialtyDetails,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
};