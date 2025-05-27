const agreementDetailsModel = require('../../models/convention_models/agreementdetails.model');

const getAgreementDetailsByContractId = async (req, res) => {
    try {
        const { contract_id } = req.params;
        const details = await agreementDetailsModel.getAgreementDetailsByContractId(contract_id);
        res.json(details);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAgreementDetailsByAvenantId = async (req, res) => {
    try {
        const { avenant_id } = req.params;
        const details = await agreementDetailsModel.getAgreementDetailsByAvenantId(avenant_id);
        res.json(details);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAgreementDetail = async (req, res) => {
    try {
        const { agreementdetail_id } = req.params;
        const {
            start_date,
            end_date,
            family_auth,
            max_price,
            min_price,
            discount_percentage,
            avenant_id,
        } = req.body;

        // Normalize avenant_id: convert empty string or 'null' to actual null
        const cleanAvenantId = !avenant_id || avenant_id === 'null' ? null : avenant_id;

        // Check if agreementdetail exists
        const existing = await agreementDetailsModel.getById(agreementdetail_id);
        if (!existing) {
            return res.status(404).json({ message: "AgreementDetail not found" });
        }

        // Update the existing agreement detail (without changing contract_id)
        const updated = await agreementDetailsModel.updateAgreementDetail(agreementdetail_id, {
            start_date,
            end_date,
            family_auth,
            max_price,
            min_price,
            discount_percentage,
            avenant_id: cleanAvenantId
        });

        res.json({
            message: "AgreementDetail updated successfully",
            agreementDetail: updated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAgreementDetailsByContractId,
    updateAgreementDetail,
    getAgreementDetailsByAvenantId
};