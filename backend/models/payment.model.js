// models/payment.model.js

const db = require("../db/connection");

// Créer un nouveau paiement
exports.createPayment = async ({ amount_paid, caisse_id, prestation_id, status }) => {
  console.log("🟢 Insertion dans DB :", amount_paid, caisse_id, prestation_id, status);
  const sql = `
    INSERT INTO Payment (amount_paid, caisse_id, prestation_id, created_at, status)
    VALUES (?, ?, ?, NOW(), ?)
  `;
  await db.execute(sql, [amount_paid, caisse_id, prestation_id, status]);
};

// Obtenir le total des paiements pour une prestation
exports.getTotalPaidByPrestation = async (prestation_id) => {
  const [rows] = await db.execute(
    `SELECT SUM(amount_paid) AS total FROM Payment WHERE prestation_id = ?`,
    [prestation_id]
  );
  return rows[0].total || 0;
};

// Récupérer tous les paiements d'une prestation
exports.getPaiementsByPrestation = async (prestation_id) => {
  const [rows] = await db.execute(
    `SELECT id, status, amount_paid, caisse_id, created_at 
     FROM Payment 
     WHERE prestation_id = ?
     ORDER BY created_at DESC`,
    [prestation_id]
  );
  return rows;
};

// Mettre à jour le statut de tous les paiements d'une prestation
exports.updateAllPaymentsStatus = async (prestation_id, status) => {
  await db.execute(
    `UPDATE Payment SET status = ? WHERE prestation_id = ?`,
    [status, prestation_id]
  );
};