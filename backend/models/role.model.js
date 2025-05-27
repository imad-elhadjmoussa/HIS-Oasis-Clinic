const db=require("./../db/connection")

const getRoles = async () => {
    const [rows] = await db.query('SELECT * FROM role');
    return rows;
}

const createRole = async (role) => {
    const query = `
        INSERT INTO roles (name, description) 
        VALUES (?, ?)
    `;

    const values = [role.name, role.description];

    try {
        const [result] = await db.query(query, values);
        return {
            ...role,
            role_id: result.insertId
        };
    } catch (error) {
        console.error("Error inserting role:", error);
        throw error;
    }
};

module.exports={
    createRole,
    getRoles
}