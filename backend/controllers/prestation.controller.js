const prestationModel = require('../models/prestation.model');

const getPrestations = async (req, res) => {
    try {
        const prestations = await prestationModel.getPrestations();
        res.status(200).json(prestations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createPrestation = async (req, res) => {
    try {
        const newPrestation = await prestationModel.createPrestation(req.body);
        res.status(201).json({
            prestation: newPrestation,
            message: 'Prestation created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const updatePrestation = async (req, res) => {
    const prestationId = req.params.id;
    try {
        const updatedPrestation = await prestationModel.updatePrestation(prestationId, req.body);
        if (!updatedPrestation) {
            return res.status(404).json({ message: 'Prestation not found' });
        }
        res.status(200).json({
            prestation: updatedPrestation,
            message: 'Prestation updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const deletePrestation = async (req, res) => {
    const prestationId = req.params.id;
    try {
        const deletedPrestation = await prestationModel.deletePrestation(prestationId);
        if (!deletedPrestation) {
            return res.status(404).json({ message: 'Prestation not found' });
        }
        res.status(200).json({ message: 'Prestation deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};


module.exports = {
    getPrestations,
    createPrestation,
    updatePrestation,
    deletePrestation
};
