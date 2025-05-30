// facture.controller.js
const db = require('../../db/connection');

const getFacturesValidees = async (req, res) => {
  const sql = `
    SELECT 
      ip.id AS invoiceId,
      ip.invoice_patient_number AS invoiceNumber,
      ip.amount,
      CONCAT(p.first_name, ' ', p.last_name) AS nomAssure,
      ip.status,
      c.company_name,
      ip.created_at
    FROM 
      InvoicePatient ip
    JOIN 
      MedicalRecord mr ON ip.medical_record_id = mr.id
    JOIN 
      Patient p ON mr.patient_id = p.id
    JOIN 
      Company c ON ip.invoice_company_id = c.id
    WHERE 
      ip.status = 'valid'
      AND ip.bordereau_id IS NULL
    ORDER BY ip.created_at DESC
  `;

  try {
    const [results] = await db.query(sql);
    
    const factures = results.map(row => ({
      invoiceId: row.invoiceId,
      invoiceNumber: row.invoiceNumber || `INV-${row.invoiceId}`,
      amount: parseFloat(row.amount) || 0,
      nomAssure: row.nomAssure,
      status: row.status,
      companyName: row.company_name,
      createdAt: row.created_at
    }));

    res.json(factures);
  } catch (err) {
    console.error('Erreur lors de la récupération des factures validées :', err);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      details: err.message 
    });
  }
};

const getFacturesValideesAvecCalcul = async (req, res) => {
  const sql = `
    SELECT 
      ip.id AS invoiceId,
      ip.invoice_patient_number AS invoiceNumber,
      CONCAT(p.first_name, ' ', p.last_name) AS nomAssure,
      ip.status,
      c.company_name,
      ip.created_at,
      ip.invoice_company_id,
      COALESCE(SUM(pmr.prestation_price), 0) AS montantCalcule,
      ip.amount AS montantFacture
    FROM 
      InvoicePatient ip
    JOIN 
      MedicalRecord mr ON ip.medical_record_id = mr.id
    JOIN 
      Patient p ON mr.patient_id = p.id
    JOIN 
      Company c ON ip.invoice_company_id = c.id
    LEFT JOIN 
      PrestationMedicalRecored pmr ON mr.id = pmr.medical_record_id
    WHERE 
      ip.status = 'valid'
      AND ip.bordereau_id IS NULL
    GROUP BY 
      ip.id, ip.invoice_patient_number, p.first_name, p.last_name, 
      ip.status, c.company_name, ip.created_at, ip.amount, ip.invoice_company_id
    ORDER BY ip.created_at DESC
  `;

  try {
    const [results] = await db.query(sql);
    
    const factures = results.map(row => ({
      id: row.invoiceId, // Ajouté pour la sélection
      invoiceId: row.invoiceId,
      invoiceNumber: row.invoiceNumber || `INV-${row.invoiceId}`,
      amount: parseFloat(row.montantFacture) || parseFloat(row.montantCalcule) || 0,
      montantCalcule: parseFloat(row.montantCalcule) || 0,
      montantFacture: parseFloat(row.montantFacture) || 0,
      nomAssure: row.nomAssure,
      status: row.status,
      companyName: row.company_name,
      invoiceCompanyId: row.invoice_company_id,
      createdAt: row.created_at
    }));

    res.json(factures);
  } catch (err) {
    console.error('Erreur lors de la récupération des factures validées :', err);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      details: err.message 
    });
  }
};

const getFactureDetails = async (req, res) => {
  const { invoiceId } = req.params;
  
  const sql = `
    SELECT 
      ip.id AS invoiceId,
      ip.invoice_patient_number AS invoiceNumber,
      ip.amount AS montantFacture,
      CONCAT(p.first_name, ' ', p.last_name) AS nomAssure,
      p.national_id_number,
      p.phone_number,
      p.email,
      ip.status,
      c.company_name,
      co.contract_name,
      ip.created_at,
      GROUP_CONCAT(
        CONCAT(pl.prestation_name, ' - ', pmr.prestation_price, ' DZD') 
        SEPARATOR '; '
      ) AS prestations
    FROM 
      InvoicePatient ip
    JOIN 
      MedicalRecord mr ON ip.medical_record_id = mr.id
    JOIN 
      Patient p ON mr.patient_id = p.id
    JOIN 
      Company c ON ip.invoice_company_id = c.id
    JOIN 
      Contract co ON mr.contract_id = co.id
    LEFT JOIN 
      PrestationMedicalRecored pmr ON mr.id = pmr.medical_record_id
    LEFT JOIN 
      PrestationPrice pp ON pmr.prestation_price_id = pp.id
    LEFT JOIN 
      PrestationList pl ON pp.prestation_list_id = pl.id
    WHERE 
      ip.id = ?
    GROUP BY 
      ip.id
  `;

  try {
    const [results] = await db.query(sql, [invoiceId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    const facture = {
      invoiceId: results[0].invoiceId,
      invoiceNumber: results[0].invoiceNumber || `INV-${results[0].invoiceId}`,
      amount: parseFloat(results[0].montantFacture) || 0,
      nomAssure: results[0].nomAssure,
      patientDetails: {
        nationalId: results[0].national_id_number,
        phone: results[0].phone_number,
        email: results[0].email
      },
      status: results[0].status,
      companyName: results[0].company_name,
      contractName: results[0].contract_name,
      prestations: results[0].prestations,
      createdAt: results[0].created_at
    };

    res.json(facture);
  } catch (err) {
    console.error('Erreur lors de la récupération des détails de la facture :', err);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      details: err.message 
    });
  }
};

// Fonction pour générer le numéro de bordereau automatiquement
const generateBordereauNumber = async () => {
  const currentYear = new Date().getFullYear();
  
  // Rechercher le dernier bordereau de l'année courante
  const sql = `
    SELECT bordereau_number 
    FROM Bordereau 
    WHERE bordereau_number LIKE '%/${currentYear}' 
    ORDER BY id DESC 
    LIMIT 1
  `;
  
  try {
    const [results] = await db.query(sql);
    
    let nextNumber = 1;
    if (results.length > 0) {
      const lastNumber = results[0].bordereau_number;
      const numberPart = parseInt(lastNumber.split('/')[0]);
      nextNumber = numberPart + 1;
    }
    
    // Format: 0001/2025
    return String(nextNumber).padStart(4, '0') + '/' + currentYear;
  } catch (err) {
    throw new Error('Erreur lors de la génération du numéro de bordereau: ' + err.message);
  }
};

// Nouvelle fonction pour générer le bordereau
const generateStatementSheet = async (req, res) => {
  const { selectedInvoices } = req.body;
  
  if (!selectedInvoices || selectedInvoices.length === 0) {
    return res.status(400).json({ error: 'Aucune facture sélectionnée' });
  }

  // Vérifier que toutes les factures appartiennent à la même compagnie
  const companyIds = [...new Set(selectedInvoices.map(invoice => invoice.invoiceCompanyId))];
  if (companyIds.length > 1) {
    return res.status(400).json({ 
      error: 'Toutes les factures doivent appartenir à la même compagnie' 
    });
  }

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Générer le numéro de bordereau
    const bordereauNumber = await generateBordereauNumber();
    
    // 2. Créer le bordereau
    const insertBordereauSql = `
      INSERT INTO Bordereau (bordereau_number, invoice_company_id) 
      VALUES (?, ?)
    `;
    
    const [bordereauResult] = await connection.query(
      insertBordereauSql, 
      [bordereauNumber, companyIds[0]]
    );
    
    const bordereauId = bordereauResult.insertId;
    
    // 3. Mettre à jour les factures sélectionnées
    const invoiceIds = selectedInvoices.map(invoice => invoice.invoiceId || invoice.id);
    const placeholders = invoiceIds.map(() => '?').join(',');
    
    const updateInvoicesSql = `
      UPDATE InvoicePatient 
      SET bordereau_id = ?, status = 'billed' 
      WHERE id IN (${placeholders}) AND status = 'valid' AND bordereau_id IS NULL
    `;
    
    const [updateResult] = await connection.query(
      updateInvoicesSql, 
      [bordereauId, ...invoiceIds]
    );
    
    // Vérifier que toutes les factures ont été mises à jour
    if (updateResult.affectedRows !== selectedInvoices.length) {
      throw new Error('Certaines factures ne peuvent pas être traitées (déjà facturées ou invalides)');
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Bordereau généré avec succès',
      bordereauId: bordereauId,
      bordereauNumber: bordereauNumber,
      invoicesProcessed: updateResult.affectedRows,
      totalAmount: selectedInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0)
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('Erreur lors de la génération du bordereau :', err);
    return res.status(500).json({ 
      error: 'Erreur lors de la génération du bordereau', 
      details: err.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getFacturesValidees,
  getFacturesValideesAvecCalcul,
  getFactureDetails,
  generateStatementSheet
};