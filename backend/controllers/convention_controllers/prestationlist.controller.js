const prestationListModel = require('../../models/convention_models/prestationlist.model');

// Get prestation list items based on annex's specialty (via annex ID)
const getPrestationListByAnnexId = async (req, res) => {
    const { annexId } = req.params;

    try {
        const prestations = await prestationListModel.getPrestationListByAnnexId(annexId);
        res.json(prestations);
    } catch (error) {
        console.error('Error fetching prestation list by annex:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get prestation list items based on avenant (via avenant ID)
const getPrestationListByAvenantId = async (req, res) => {
    const { avenantId } = req.params;
    try {
        const prestations = await prestationListModel.getPrestationListByAvenantId(avenantId);
        res.json(prestations);
    } catch (error) {
        console.error('Error fetching prestation list by avenant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getPrestationListByAnnexId,
    getPrestationListByAvenantId
};
