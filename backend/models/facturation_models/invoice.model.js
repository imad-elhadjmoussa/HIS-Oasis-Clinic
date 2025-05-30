const db = require('../../db/connection'); // db est déjà une instance avec des promesses (mysql2/promise)

const InvoicePatient = {
  findById: (id) => {
    return db.query("SELECT * FROM InvoicePatient WHERE id = ?", [id]);
  },

  findLastNumberByYear: (year) => {
    return db.query(
      `SELECT invoice_patient_number
       FROM InvoicePatient
       WHERE invoice_patient_number LIKE '%/${year}'
       ORDER BY invoice_patient_number DESC
       LIMIT 1`
    );
  },

  updateNumberAndStatus: (id, number) => {
    return db.query(
      `UPDATE InvoicePatient
       SET invoice_patient_number = ?, status = 'valid'
       WHERE id = ?`,
      [number, id]
    );
  }
};

module.exports = InvoicePatient;
