const db = require("../../db/connection");

// Récupérer les prestations par fiche médicale
exports.getPrestationsByMedicalRecordId = async (ficheId) => {
  const [rows] = await db.query(`
    SELECT 
      p.id,
      pl.prestation_name,
      p.prestation_price AS price,
      p.payment_status AS status,
      IFNULL(SUM(pay.amount_paid), 0) AS amountPaid
    FROM PrestationMedicalRecored p
    JOIN PrestationPrice pp ON p.prestation_price_id = pp.id
    JOIN PrestationList pl ON pp.prestation_list_id = pl.id
    LEFT JOIN Payment pay ON pay.prestation_medical_recored_id = p.id
    WHERE p.medical_record_id = ?
    GROUP BY p.id, pl.prestation_name, p.prestation_price, p.payment_status
  `, [ficheId]);

  return rows;
};

// Récupérer une prestation par ID
exports.getPrestationById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM PrestationMedicalRecored WHERE id = ?', 
    [id]
  );
  return rows[0];
};

// Mettre à jour le statut automatiquement selon le total payé
exports.updateStatusAuto = async (id) => {
  try {
    const [prestationRows] = await db.query(
      `SELECT prestation_price FROM PrestationMedicalRecored WHERE id = ?`, 
      [id]
    );
    if (prestationRows.length === 0) return null;
    const price = prestationRows[0].prestation_price;

    const [paymentRows] = await db.query(
      `SELECT SUM(amount_paid) AS totalPaid FROM Payment WHERE prestation_medical_recored_id = ?`, 
      [id]
    );
    const totalPaid = paymentRows[0].totalPaid || 0;

    const isPaid = Math.round(totalPaid * 100) >= Math.round(price * 100);
    const newStatus = isPaid ? 'paid' : 'unpaid';

    await db.query(
      `UPDATE PrestationMedicalRecored SET payment_status = ? WHERE id = ?`,
      [newStatus, id]
    );

    return newStatus;
  } catch (error) {
    console.error("Erreur dans updateStatusAuto:", error);
    throw error;
  }
};

// Forcer le statut manuellement
exports.updateStatus = async (id, status) => {
  await db.query(
    `UPDATE PrestationMedicalRecored SET payment_status = ? WHERE id = ?`, 
    [status, id]
  );
};

// Modifier le prix et mettre à jour automatiquement le statut
exports.updatePrice = async (prestationId, nouveauPrix) => {
  await db.query(
    'UPDATE PrestationMedicalRecored SET prestation_price = ? WHERE id = ?',
    [nouveauPrix, prestationId]
  );
  await exports.updateStatusAuto(prestationId);
};
