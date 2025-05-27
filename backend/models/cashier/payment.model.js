const db = require("../../db/connection");

// Créer un nouveau paiement
exports.createPayment = async ({ amount_paid, prestation_id, status }) => {
  console.log("🟢 Insertion dans DB :", amount_paid, prestation_id, status);
  const sql = `
    INSERT INTO Payment (amount_paid, prestation_medical_recored_id, created_at, status)
    VALUES (?, ?, NOW(), ?)
  `;
  await db.execute(sql, [amount_paid, prestation_id, status]);
};

// Obtenir le total payé pour une prestation
exports.getTotalPaidByPrestation = async (prestation_id) => {
  const [rows] = await db.execute(
    `SELECT SUM(amount_paid) AS total FROM Payment WHERE prestation_medical_recored_id = ?`,
    [prestation_id]
  );
  return rows[0].total || 0;
};

// Récupérer l’historique des paiements d'une prestation
exports.getPaiementsByPrestation = async (prestation_id) => {
  const [rows] = await db.execute(
    `SELECT id, status, amount_paid, created_at
     FROM Payment 
     WHERE prestation_medical_recored_id = ?
     ORDER BY created_at DESC`,
    [prestation_id]
  );
  return rows;
};

// Mettre à jour tous les statuts des paiements
exports.updateAllPaymentsStatus = async (prestation_id, status) => {
  await db.execute(
    `UPDATE Payment SET status = ? WHERE prestation_medical_recored_id = ?`,
    [status, prestation_id]
  );
};
