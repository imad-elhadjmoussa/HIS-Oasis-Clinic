const InvoicePatient = require('../../models/facturation_models/invoice.model');
const db = require('../../db/connection'); // db est déjà une instance avec des promesses (mysql2/promise)
const moment = require('moment');

exports.validateAndGenerateNumber = async (req, res) => {
  const invoiceId = req.params.id;
  const currentYear = moment().format('YYYY');

  try {
    // Vérifier que la facture existe et est en attente
    const [rows] = await InvoicePatient.findById(invoiceId);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Facture introuvable." });
    }

    const invoice = rows[0];
    if (invoice.status !== 'waiting') {
      return res.status(400).json({ message: "Facture déjà validée ou facturée." });
    }

    // Récupérer le dernier numéro de facture de l'année en cours
    const [lastInvoices] = await InvoicePatient.findLastNumberByYear(currentYear);
    let nextNumber = 1;

    if (lastInvoices.length > 0) {
      const lastNum = lastInvoices[0].invoice_patient_number.split('/')[0];
      nextNumber = parseInt(lastNum, 10) + 1;
    }

    const formattedNumber = String(nextNumber).padStart(4, '0') + '/' + currentYear;

    // Mise à jour de la facture (waiting -> valid)
    await InvoicePatient.updateNumberAndStatus(invoiceId, formattedNumber);

    // NOUVEAU : Mise à jour du statut du MedicalRecord associé (unbilled -> billed)
    await db.query(
      `UPDATE MedicalRecord mr
       JOIN InvoicePatient ip ON mr.id = ip.medical_record_id
       SET mr.status = 'billed'
       WHERE ip.id = ? AND mr.status = 'unbilled'`,
      [invoiceId]
    );

    res.status(200).json({
      message: "Facture validée avec succès et dossier médical mis à jour.",
      invoice_patient_number: formattedNumber
    });
  } catch (error) {
    console.error("Erreur lors de la validation de la facture :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Version avec transaction pour plus de sécurité
exports.validateAndGenerateNumberWithTransaction = async (req, res) => {
  const invoiceId = req.params.id;
  const currentYear = moment().format('YYYY');

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Vérifier que la facture existe et est en attente
    const [rows] = await connection.query("SELECT * FROM InvoicePatient WHERE id = ?", [invoiceId]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Facture introuvable." });
    }

    const invoice = rows[0];
    if (invoice.status !== 'waiting') {
      await connection.rollback();
      return res.status(400).json({ message: "Facture déjà validée ou facturée." });
    }

    // Récupérer le dernier numéro de facture de l'année en cours
    const [lastInvoices] = await connection.query(
      `SELECT invoice_patient_number
       FROM InvoicePatient
       WHERE invoice_patient_number LIKE '%/${currentYear}'
       ORDER BY invoice_patient_number DESC
       LIMIT 1`
    );
    
    let nextNumber = 1;
    if (lastInvoices.length > 0) {
      const lastNum = lastInvoices[0].invoice_patient_number.split('/')[0];
      nextNumber = parseInt(lastNum, 10) + 1;
    }

    const formattedNumber = String(nextNumber).padStart(4, '0') + '/' + currentYear;

    // Mise à jour de la facture (waiting -> valid)
    await connection.query(
      `UPDATE InvoicePatient
       SET invoice_patient_number = ?, status = 'valid'
       WHERE id = ?`,
      [formattedNumber, invoiceId]
    );

    // Mise à jour du statut du MedicalRecord associé (unbilled -> billed)
    await connection.query(
      `UPDATE MedicalRecord mr
       JOIN InvoicePatient ip ON mr.id = ip.medical_record_id
       SET mr.status = 'billed'
       WHERE ip.id = ? AND mr.status = 'unbilled'`,
      [invoiceId]
    );

    await connection.commit();

    res.status(200).json({
      message: "Facture validée avec succès et dossier médical mis à jour.",
      invoice_patient_number: formattedNumber
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erreur lors de la validation de la facture :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    connection.release();
  }
};