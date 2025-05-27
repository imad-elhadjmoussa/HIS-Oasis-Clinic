const roleModel = require('../models/role.model');

const getRoles = async (req, res) => {
    try {
        const roles = await roleModel.getRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createRole = async (req, res) => {
    try {
        const { name,description } = req.body;
        //  Check for missing fields
        if (!name || !description ) {
            return res.status(400).json({ message: "All fields are required" });
        }
        //  Create new role
        const newRole = await roleModel.createRole(req.body);
        res.status(201).json({ message: "Role created successfully", role: newRole });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports={
    getRoles,
    createRole
}