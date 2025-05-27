const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
        const users = await userModel.getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userModel.getUserById(id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check for missing fields
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // 3. Validate password strength (at least 6 characters)
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create new user with hashed password
        const newUser = await userModel.createUser({
            ...req.body,
            password: hashedPassword
        });

        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;


        if(req.body.password) {
            // 1. Validate password strength (at least 6 characters)
            if (req.body.password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }

            // 2. Hash the new password
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        // 6. Perform the update
        const updatedUser = await userModel.updateUser(id, req.body);

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await userModel.deleteUser(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const userUpdated = await userModel.updateUserProfile(id, req.body);
        if (!userUpdated) {
            return res.status(404).json({ message: "User not found" });
        }
        req.session.user = {
            ...req.session.user,
            ...userUpdated
        };
        res.json(userUpdated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserProfile
}