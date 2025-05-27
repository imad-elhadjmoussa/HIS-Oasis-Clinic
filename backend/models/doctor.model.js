const db = require("../db/connection");



const getDoctors = async () => {
    const [rows] = await db.query("SELECT * FROM Doctor");
    return rows;
};

const getDoctorById = async (doctorId) => {
    const [rows] = await db.query("SELECT * FROM Doctor WHERE id = ?", [doctorId]);
    return rows[0] || null;
};

const createDoctor = async (data) => {
    const {
        first_name,
        last_name,
        national_id_number,
        date_of_birth,
        phone_number,
        email,
        gender,
        specialty_id
    } = data;

    const mysqlDate = new Date(date_of_birth).toISOString().split('T')[0];

    try {
        const [result] = await db.query(`
            INSERT INTO Doctor 
            (first_name, last_name, national_id_number, date_of_birth, phone_number, email, gender, specialty_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [first_name, last_name, national_id_number, mysqlDate, phone_number, email, gender, specialty_id]);

        return { id: result.insertId, ...data };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('national_id_number')) {
                throw new Error('National ID number already exists.');
            } else if (error.message.includes('phone_number')) {
                throw new Error('Phone number already exists.');
            } else if (error.message.includes('email')) {
                throw new Error('Email already exists.');
            }
        }

        console.error("Error creating doctor:", error);
        throw new Error("Can't create doctor.");
    }
};


const updateDoctor = async (doctorId, data) => {
    const {
        first_name,
        last_name,
        national_id_number,
        date_of_birth,
        phone_number,
        email,
        gender,
        specialty_id
    } = data;

    const mysqlDate = new Date(date_of_birth).toISOString().split('T')[0];

    try {
        const [result] = await db.query(`
            UPDATE Doctor SET 
                first_name = ?, 
                last_name = ?, 
                national_id_number = ?, 
                date_of_birth = ?, 
                phone_number = ?, 
                email = ?, 
                gender = ?, 
                specialty_id = ?
            WHERE id = ?
        `, [
            first_name,
            last_name,
            national_id_number,
            mysqlDate,
            phone_number,
            email,
            gender,
            specialty_id,
            doctorId
        ]);

        if (result.affectedRows === 0) {
            return null; // Doctor not found or no changes made
        }

        return { id: doctorId, ...data };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('national_id_number')) {
                throw new Error('National ID number already exists.');
            } else if (error.message.includes('phone_number')) {
                throw new Error('Phone number already exists.');
            } else if (error.message.includes('email')) {
                throw new Error('Email already exists.');
            }
        }

        console.error("Error updating doctor:", error);
        throw new Error("Can't update doctor.");
    }
};


const deleteDoctor = async (doctorId) => {
    const [result] = await db.query("DELETE FROM Doctor WHERE id = ?", [doctorId]);
    return result.affectedRows > 0;
};

module.exports = {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
};
