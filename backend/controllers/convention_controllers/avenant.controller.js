const avenantModel = require('../../models/convention_models/avenant.model');
const pool = require('./../../db/connection'); // Your database pool connection

const createAvenantAndDuplicatePrestations = async (req, res) => {
    const { contractId } = req.params;
    
    if (!contractId) {
        return res.status(400).json({ error: 'contractId is required' });
    }
    
    try {
        const connection = await pool.getConnection();
        
        // Check if the contract already has any avenants
        const [existingAvenants] = await connection.execute(
            'SELECT id FROM Avenant WHERE contract_id = ? LIMIT 1',
            [contractId]
        );
        
        let result;
        
        if (existingAvenants.length === 0) {
            // First avenant for this contract
            result = await avenantModel.duplicateAllPrestationsWithNewAvenant(connection, contractId);
        } else {
            // Contract already has at least one avenant
            result = await avenantModel.duplicateAllPrestationsWithExistingAvenant(connection, contractId);
        }
        
        connection.release();
        
        res.status(201).json({
            message: 'Avenant created and prestations duplicated successfully',
            result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const activateAvenant = async (req, res) => {
    const { avenantId } = req.params;
    const { activationDate } = req.body; // Get the activation date from request body
    const activate_later = req.query.activate_later; // Get the activate_later query parameter
   
    if (!avenantId) {
        return res.status(400).json({ error: 'avenantId is required' });
    }
   
    // Validate the date format if provided, or use current date
    let activateAt = null;
    if (activationDate) {
        // Check if valid date
        if (isNaN(Date.parse(activationDate))) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
       
        // Use the date exactly as provided
        activateAt = activationDate;
    } else {
        // Current date in MySQL format YYYY-MM-DD
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        activateAt = `${year}-${month}-${day}`;
    }
    
    // Determine if this is a delayed activation
    const isDelayedActivation = activate_later === 'yes';
   
    try {
        const connection = await pool.getConnection();
        const result = await avenantModel.activateAvenantById(
            connection,
            avenantId,
            activateAt,
            isDelayedActivation
        );
        connection.release();
       
        const message = isDelayedActivation
            ? 'Avenant scheduled for activation successfully'
            : 'Avenant activated successfully';
           
        res.status(200).json({
            message,
            result,
            activateAt // Return the exact date used
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


const getAvenantById = async (req, res) => {
    const { avenantId } = req.params;

    if (!avenantId) {
        return res.status(400).json({ error: 'avenantId is required' });
    }

    try {
        // Get connection from the pool
        const connection = await pool.getConnection();

        // Pass the connection to the model function
        const avenant = await avenantModel.getAvenantById(connection, avenantId);
        connection.release(); // Release the connection back to the pool

        if (!avenant) {
            return res.status(404).json({ message: 'Avenant not found' });
        }

        res.json(avenant);
    } catch (error) {
        console.error('Error fetching avenant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const checkPendingAvenantByContractId = async (req, res) => {
    const { contractId } = req.params;

    if (!contractId) {
        return res.status(400).json({ error: 'contractId is required' });
    }

    try {
        // Get connection from the pool
        const connection = await pool.getConnection();

        // Pass the connection to the model function
        const pendingAvenant = await avenantModel.findPendingAvenantByContractId(connection, contractId);
        connection.release(); // Release the connection back to the pool

        res.json({ hasPending: !!pendingAvenant }); // true if found, false if null
    } catch (error) {
        console.error('Error checking pending avenant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAvenantsByContractId = async (req, res) => {
    const { contractId } = req.params;

    if (!contractId) {
        return res.status(400).json({ error: 'contractId is required' });
    }

    try {
        const connection = await pool.getConnection();
        const avenants = await avenantModel.getAvenantsByContractId(connection, contractId);
        connection.release();

        res.json(avenants); // returns an array of avenants
    } catch (error) {
        console.error('Error fetching avenants by contract ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createAvenantAndDuplicatePrestations,
    activateAvenant,
    getAvenantById,
    checkPendingAvenantByContractId,
    getAvenantsByContractId
};
