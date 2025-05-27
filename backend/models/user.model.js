const db = require("./../db/connection")

const getUsers = async () => {
    const [rows] = await db.query('SELECT * FROM user');
    return rows;
}

const getUserById = async (id) => {
    const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
    return rows;
}

const createUser = async (user) => {
    const query = `
        INSERT INTO user (
            first_name, last_name, national_id_number, date_of_birth,
            phone_number, email, gender, password, status, specialty_id, role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const mysqlDate = new Date(user.date_of_birth).toISOString().split('T')[0];

    const values = [
        user.first_name,
        user.last_name,
        user.national_id_number,
        mysqlDate,
        user.phone_number,
        user.email || null,
        user.gender || null,
        user.password,
        user.status || 'active',
        user.specialty_id || null,
        user.role
    ];

    try {
        const [result] = await db.query(query, values);
        return {
            ...user,
            id: result.insertId
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('national_id_number')) {
                throw new Error('National ID number already exists.');
            }
            if (error.message.includes('phone_number')) {
                throw new Error('Phone number already exists.');
            }
            if (error.message.includes('email')) {
                throw new Error('Email already exists.');
            }
        }

        console.error("Error inserting user:", error);
        throw new Error('Failed to create user.');
    }
};



const updateUser = async (id, user) => {
    try {
        const mysqlDate = new Date(user.date_of_birth).toISOString().split('T')[0];

        // Base fields and values
        const fields = [
            'first_name = ?',
            'last_name = ?',
            'national_id_number = ?',
            'date_of_birth = ?',
            'phone_number = ?',
            'email = ?',
            'gender = ?',
            'status = ?',
            'specialty_id = ?',
            'role = ?'
        ];

        const values = [
            user.first_name,
            user.last_name,
            user.national_id_number,
            mysqlDate,
            user.phone_number,
            user.email || null,
            user.gender || null,
            user.status || 'active',
            user.specialty_id || null,
            user.role
        ];

        // Conditionally add password
        if (user.password && user.password.trim() !== '') {
            fields.splice(7, 0, 'password = ?'); // Insert at the correct position
            values.splice(7, 0, user.password);  // Insert corresponding value
        }

        values.push(id); // Add id for WHERE clause

        const [result] = await db.query(
            `UPDATE user SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            throw new Error("User not found or no changes made.");
        }

        const { password, ...userWithoutPassword } = user;

        return {
            ...userWithoutPassword,
            id
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('national_id_number')) {
                throw new Error('National ID number already exists.');
            }
            if (error.message.includes('phone_number')) {
                throw new Error('Phone number already exists.');
            }
            if (error.message.includes('email')) {
                throw new Error('Email already exists.');
            }
        }
        console.error("Error updating user:", error);
        return { success: false, message: error.message };
    }
};


const deleteUser = async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
    return result;
}

const updateUserProfile = async (id, user) => {
    const mysqlDate = new Date(user.date_of_birth).toISOString().split('T')[0];
    try {
        const [result] = await db.query(
            `UPDATE user 
             SET first_name = ?, last_name = ?, national_id_number = ?, date_of_birth = ?, 
                 phone_number = ?, email = ?,  gender = ?
                WHERE id = ?
                 `,
            [
                user.first_name,
                user.last_name,
                user.national_id_number,
                mysqlDate,
                user.phone_number,
                user.email || null,
                user.gender,
                id
            ]
        );
        if (result.affectedRows === 0) {
            throw new Error("User not found or no changes made.");
        }
        return { ...user, id };
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        return { success: false, message: error.message };
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