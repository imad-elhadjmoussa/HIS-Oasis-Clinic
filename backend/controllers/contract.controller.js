const contractModel = require('../models/contract.model');

// Create a new contract for a specific company
const createContractForCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { contract_name, start_date, end_date } = req.body;

        // Check for required fields
        if (!contract_name || !start_date || !end_date) {
            return res.status(400).json({ message: "contract_name, start_date, and end_date are required" });
        }

        // Create the contract and agreement details for the company
        const newContract = await contractModel.createContractForCompany(companyId, { contract_name, start_date, end_date });

        res.status(201).json({
            message: "Contract and Agreement created successfully",
            contract: newContract
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getContractsByCompanyId = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { status } = req.query;

        // Pass status to the model only if provided
        const contracts = await contractModel.getContractsByCompanyId(companyId, status);

        if (contracts.length === 0) {
            return res.status(404).json({ message: "No contracts found for this company" });
        }

        res.status(200).json(contracts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getContractDetails = async (req, res) => {
    try {
        const { contractId } = req.params;

        // Fetch contract details by ID
        const contractDetails = await contractModel.getContractDetails(contractId);

        if (!contractDetails) {
            return res.status(404).json({ message: "Contract not found" });
        }

        res.status(200).json(contractDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Activate contract (set status to 'Active')
const activateContract = async (req, res) => {
    try {
        const { contractId } = req.params;

        const updatedContract = await contractModel.updateContractStatus(contractId, 'Active');

        if (!updatedContract) {
            return res.status(404).json({ message: "Contract not found" });
        }

        res.status(200).json({
            message: "Contract status updated to Active",
            contract: updatedContract
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Expire contract (set status to 'Expired')
const expireContract = async (req, res) => {
    try {
        const { contractId } = req.params;

        const updatedContract = await contractModel.updateContractStatus(contractId, 'Expired');

        if (!updatedContract) {
            return res.status(404).json({ message: "Contract not found" });
        }

        res.status(200).json({
            message: "Contract status updated to Expired",
            contract: updatedContract
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all contracts
const getAllContracts = async (req, res) => {
    try {
      const contracts = await contractModel.getAllContracts();
      res.status(200).json(contracts);
    } catch (error) {
      console.error('Error getting all contracts:', error);
      res.status(500).json({ message: 'Failed to get contracts' });
    }
  };

module.exports = {
    createContractForCompany,
    getContractsByCompanyId,
    activateContract,
    expireContract,
    getAllContracts,
    getContractDetails
};
