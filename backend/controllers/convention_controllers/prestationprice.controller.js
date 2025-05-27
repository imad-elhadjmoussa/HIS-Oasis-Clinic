const prestationPriceModel = require('../../models/convention_models/prestationprice.model');

// Add a prestation (Annex ID as param)
const addPrestation = async (req, res) => {
    const { annexId } = req.params;
    const { price, patient_part, tva = 9.00, updated_by_id, prestation_list_id, avenant_id, head } = req.body;
    try {
        const newPrestation = await prestationPriceModel.addPrestation(
            annexId, 
            price, 
            patient_part, 
            tva, 
            updated_by_id, 
            prestation_list_id, 
            avenant_id, 
            head
        );
        res.status(201).json(newPrestation);
    } catch (error) {
        console.error('Error adding prestation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add a prestation in an avenant (Avenant ID as param)
const addPrestationInAvenant = async (req, res) => {
    const { avenantId } = req.params;
    const { price, patient_part, tva = 9.00, updated_by_id, prestation_list_id, annex_id, head } = req.body;
   
    try {
        const newPrestation = await prestationPriceModel.addPrestationInAvenant(
            annex_id,
            price,
            patient_part,
            tva,
            updated_by_id,
            prestation_list_id,
            avenantId,
            head || 'no' // Provide default value for head if not specified
        );
       
        res.status(201).json(newPrestation);
    } catch (error) {
        console.error('Error adding prestation in avenant:', error);
       
        // Send more specific error message to client
        if (error.message === 'Prestation not found') {
            return res.status(404).json({ message: 'Prestation not found' });
        } else if (error.message === 'Avenant not found') {
            return res.status(404).json({ message: 'Avenant not found' });
        } else if (error.message === 'Specialty not found') {
            return res.status(404).json({ message: 'Specialty not found' });
        }
       
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get all prestations for an annex (Annex ID as param)
const getPrestationByAnnexId = async (req, res) => {
    const { annexId } = req.params;
    try {
        const prestations = await prestationPriceModel.getPrestationByAnnexId(annexId);
        res.json(prestations);
    } catch (error) {
        console.error('Error fetching prestations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all prestations for an avenant (Avenant ID as param)
const getPrestationByAvenantId = async (req, res) => {
    const { avenantId } = req.params;
    try {
        const prestations = await prestationPriceModel.getPrestationByAvenantId(avenantId);
        res.json(prestations);
    } catch (error) {
        console.error('Error fetching prestations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Edit a prestation (Prestation Price ID as param)
const editPrestation = async (req, res) => {
    const { prestationId } = req.params;
    const { price, patient_part, tva, updated_by_id, prestation_list_id, avenant_id, head } = req.body;
    try {
        const updatedPrestation = await prestationPriceModel.editPrestation(
            prestationId,
            price,
            patient_part,
            tva,
            updated_by_id,
            prestation_list_id,
            avenant_id,
            head
        );
        if (updatedPrestation) {
            res.json(updatedPrestation);
        } else {
            res.status(404).json({ message: 'Prestation not found' });
        }
    } catch (error) {
        console.error('Error updating prestation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a prestation (Prestation Price ID as param)
const deletePrestation = async (req, res) => {
    const { prestationId } = req.params;
    try {
        const result = await prestationPriceModel.deletePrestation(prestationId);
        if (result) {
            res.json({ message: 'Prestation deleted successfully' });
        } else {
            res.status(404).json({ message: 'Prestation not found' });
        }
    } catch (error) {
        console.error('Error deleting prestation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a prestation that belongs to an avenant (Prestation Price ID as param)
const deleteAvenantPrestation = async (req, res) => {
    const { prestationId } = req.params;
    try {

        // Delete the prestation
        const result = await prestationPriceModel.deleteAvenantPrestation(prestationId);

        if (result) {
            res.json({ message: 'Avenant prestation deleted successfully' });
        } else {
            res.status(404).json({ message: 'Prestation not found or already deleted' });
        }
    } catch (error) {
        console.error('Error deleting avenant prestation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    addPrestation,
    getPrestationByAnnexId,
    editPrestation,
    deletePrestation,
    getPrestationByAvenantId,
    deleteAvenantPrestation,
    addPrestationInAvenant
};