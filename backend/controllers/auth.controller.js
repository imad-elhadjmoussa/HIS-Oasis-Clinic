
const db = require('../db/connection'); // Import the database connection
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 2. Fetch user
        const [rows] = await db.query(`
        SELECT 
            u.*, 
            s.specialty_name
        FROM User u
            LEFT JOIN Specialty s ON u.specialty_id = s.id
            WHERE u.email = ?
            LIMIT 1
        `, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = rows[0];

        // 3. Check status
        if (user.status !== 'active') {
            return res.status(403).json({ message: "Account is inactive" });
        }

        // 4. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 5. Remove password before storing in session
        const { password: _, ...userWithoutPassword } = user;

        // 6. Store full user object in session
        req.session.user = userWithoutPassword;

        res.status(200).json({
            message: "Login successful",
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




const logout = (req, res) => {
    console.log("Logout request received");
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to log out.' });
        }

        // Optionally, clear the session cookie (if using cookies for session)
        res.clearCookie('connect.sid'); // Assuming the cookie name is 'connect.sid'

        // Send a response confirming logout
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

const checkSession = (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Not logged in' });
    res.json(
        req.session.user
    );
}




module.exports = {
    login,
    logout,
    checkSession
};