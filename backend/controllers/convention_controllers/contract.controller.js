const contractModel = require('../../models/convention_models/contract.model');
const db = require("./../../db/connection");

// Create a new contract for a specific company
const createContractForCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { 
            contract_name, 
            start_date, 
            end_date, 
            max_price, 
            min_price, 
            discount_percentage, 
            family_auth 
        } = req.body;
        
        // Check for required fields
        if (!contract_name || !start_date || !end_date) {
            return res.status(400).json({ message: "contract_name, start_date, and end_date are required" });
        }
        
        // Create the contract and agreement details for the company
        const newContract = await contractModel.createContractForCompany(
            companyId, 
            { 
                contract_name, 
                start_date, 
                end_date,
                max_price,
                min_price,
                discount_percentage,
                family_auth
            }
        );
        
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



        res.status(200).json(contracts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Activate contract (set status to 'Active')
const activateContract = async (req, res) => {
    try {
        const { contractId } = req.params;

        const updatedContract = await contractModel.updateContractStatus(contractId, 'Active');

        if (!updatedContract) {
            return res.status(404).json({ message: "Contract not found" });
        }

               // Check if the contract has at least one annex using direct query
        const [annexes] = await db.query(
            'SELECT COUNT(*) as annexCount FROM Annex WHERE contract_id = ?', 
            [contractId]
        );
        
        // If no annexes exist, return an error
        if (annexes[0].annexCount <= 0) {
            return res.status(400).json({ 
                message: "Cannot activate contract: At least one annex is required before activation" 
            });
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

                // Check if contract is general before expiring
        const checkGeneralQuery = `
            SELECT is_general 
            FROM Contract 
            WHERE id = ?
        `;
        
        const [contractCheck] = await db.execute(checkGeneralQuery, [contractId]);

              if (contractCheck[0].is_general === 'yes') {
            return res.status(400).json({ message: "Cannot terminate general contract" });
        }

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


  // Get contract info by ID
const getContractById = async (req, res) => {
    try {
        const contractId = req.params.contractId;
        
        const contract = await contractModel.getContractById(contractId);
        
        if (!contract) {
            return res.status(404).json({ message: "Contract not found" });
        }

        res.status(200).json(contract);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete contract and associated data
const deleteContract = async (req, res) => {
    try {
        const contractId = req.params.contractId;
        
        // Call the model function to delete the contract
        const result = await contractModel.deleteContractById(contractId);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Contract not found or already deleted" });
        }
        
        res.status(200).json({ message: "Contract deleted successfully" });
    } catch (error) {
        console.error("Error deleting contract:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createContractForCompany,
    getContractsByCompanyId,
    activateContract,
    expireContract,
    getAllContracts,
    getContractById,
    deleteContract
};
