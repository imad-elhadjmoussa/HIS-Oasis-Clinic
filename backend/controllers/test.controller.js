
const db = require("./../db/connection")

const getCompanies = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM company');
    return res.json({ companies: rows });
}

const getCompanyContracts = (req, res) => {
    const companyId = req.params.id;
    const companyContracts = contracts.filter(contract => contract.company_id === parseInt(companyId));
    res.status(200).json(companyContracts);
}

module.exports = {
    getCompanies,
    getCompanyContracts
};
