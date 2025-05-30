//entreprise.model
const db = require('../../db/connection');



const getEntreprisesWithNonFacturedCount = async () => {
  const sql = `
    SELECT
  c.id AS company_id,
  c.company_name,
  COUNT(DISTINCT CASE WHEN ip.status = 'waiting' THEN ip.medical_record_id END) AS non_factured_count
FROM Company c
LEFT JOIN InvoicePatient ip ON ip.invoice_company_id = c.id
GROUP BY c.id, c.company_name;

  `;

  const [rows] = await db.query(sql);
  return rows;
};






const getAllCompanies = async () => {
  const sql = `
    SELECT 
      id,
      company_name,
      address,
      phone_number,
      email,
      is_public
    FROM Company
    ORDER BY company_name;
  `;

  const [rows] = await db.query(sql);
  return rows;
};

const getCompanyById = async (id) => {
  const sql = `
    SELECT 
      id,
      company_name,
      address,
      phone_number,
      email,
      is_public
    FROM Company
    WHERE id = ?;
  `;

  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

const createCompany = async (companyData) => {
  const { company_name, address, phone_number, email, is_public } = companyData;
  const sql = `
    INSERT INTO Company (company_name, address, phone_number, email, is_public)
    VALUES (?, ?, ?, ?, ?);
  `;

  const [result] = await db.query(sql, [company_name, address, phone_number, email, is_public]);
  return { id: result.insertId, ...companyData };
};

const updateCompany = async (id, companyData) => {
  const { company_name, address, phone_number, email, is_public } = companyData;
  const sql = `
    UPDATE Company
    SET company_name = ?, address = ?, phone_number = ?, email = ?, is_public = ?
    WHERE id = ?;
  `;

  await db.query(sql, [company_name, address, phone_number, email, is_public, id]);
  return { id, ...companyData };
};

const deleteCompany = async (id) => {
  const sql = `DELETE FROM Company WHERE id = ?;`;
  await db.query(sql, [id]);
  return { id };
};

module.exports = {
  getEntreprisesWithNonFacturedCount,
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};
