const modalityModel = require('../models/modality.model');

const getModalities = async (req, res) => {
    try {
        const modalities = await modalityModel.getModalities();
        res.status(200).json(modalities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getModalityDetails = async (req, res) => {
    const modalityId = req.params.modalityId;
    try {
        const modality = await modalityModel.getModalityDetails(modalityId);
        if (!modality) {
            return res.status(404).json({ message: 'Modality not found' });
        }
        res.status(200).json(modality);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createModality = async (req, res) => {
    try {
        const newModality = await modalityModel.createModality(req.body);
        res.status(201).json({
            modality: newModality,
            message: 'Modality created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const updateModality = async (req, res) => {
    const modalityId = req.params.id;
    try {
        const updatedModality = await modalityModel.updateModality(modalityId, req.body);
        if (!updatedModality) {
            return res.status(404).json({ message: 'Modality not found' });
        }
        res.status(200).json({
            modality: updatedModality,
            message: 'Modality updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const deleteModality = async (req, res) => {
    const modalityId = req.params.id;
    try {
        const deleted = await modalityModel.deleteModality(modalityId);
        if (!deleted) {
            return res.status(404).json({ message: 'Modality not found' });
        }
        res.status(200).json({ message: 'Modality deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

module.exports = {
    getModalities,
    getModalityDetails,
    createModality,
    updateModality,
    deleteModality
};
