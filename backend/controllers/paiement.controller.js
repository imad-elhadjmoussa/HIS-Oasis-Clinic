// controllers/paiement.controller.js

const paymentModel = require("../models/payment.model");
const MedicalRecordPrestation = require("../models/medical_record-prestation.model");

// Créer un paiement et mettre à jour automatiquement le statut
const createPaiement = async (req, res) => {
  const { amount_paid, caisse_id, prestation_id } = req.body;
  console.log("🔔 Paiement reçu :", { amount_paid, caisse_id, prestation_id });

  try {
    // 1. Récupérer la prestation pour connaître son prix original
    const prestation = await MedicalRecordPrestation.getPrestationById(prestation_id);
    
    if (!prestation) {
      return res.status(404).json({ message: "Prestation non trouvée" });
    }
    
    // 2. Enregistrer le paiement
    await paymentModel.createPayment({ 
      amount_paid, 
      caisse_id, 
      prestation_id,
      // Assignation du statut initial (toujours 'not paid' à la création)
      status: 'not paid'
    });

    // 3. Calculer le total payé pour cette prestation
    const totalPaid = await paymentModel.getTotalPaidByPrestation(prestation_id);
    
    // Debug log
    console.log(`Prestation #${prestation_id} - Prix: ${prestation.prestation_price}, Total payé: ${totalPaid}`);

    // 4. Déterminer si la prestation est complètement payée
    // On utilise une comparaison stricte avec un arrondi pour éviter les problèmes de précision décimale
    const isPaid = Math.round(totalPaid * 100) >= Math.round(prestation.prestation_price * 100);
    
    // Debug log
    console.log(`Est payée? ${isPaid} (${totalPaid} >= ${prestation.prestation_price})`);

    // 5. Mettre à jour le statut sur tous les paiements et sur la prestation
    if (isPaid) {
      await paymentModel.updateAllPaymentsStatus(prestation_id, 'paid');
      await MedicalRecordPrestation.updateStatus(prestation_id, 'paid');
    } else {
      // Si pas complètement payé, on s'assure que tous les paiements sont marqués 'not paid'
      await paymentModel.updateAllPaymentsStatus(prestation_id, 'not paid');
      await MedicalRecordPrestation.updateStatus(prestation_id, 'not paid');
    }

    // 6. Calculer le montant restant
    const remainingAmount = Math.max(0, prestation.prestation_price - totalPaid);

    res.status(201).json({ 
      message: "Paiement enregistré avec succès", 
      status: isPaid ? 'paid' : 'not paid',
      remainingAmount: remainingAmount
    });

  } catch (err) {
    console.error("Erreur lors de l'enregistrement du paiement :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer l'historique des paiements d'une prestation
const getPaiementsByPrestation = async (req, res) => {
  const prestationId = req.params.id;

  try {
    const paiements = await paymentModel.getPaiementsByPrestation(prestationId);
    
    // Récupérer le prix total et calculer le restant
    const prestation = await MedicalRecordPrestation.getPrestationById(prestationId);
    
    if (!prestation) {
      return res.status(404).json({ message: "Prestation non trouvée" });
    }
    
    const totalPaid = paiements.reduce((sum, payment) => sum + parseFloat(payment.amount_paid), 0);
    
    // Utiliser la même logique stricte pour déterminer si c'est payé
    const isPaid = Math.round(totalPaid * 100) >= Math.round(prestation.prestation_price * 100);
    const remainingAmount = Math.max(0, prestation.prestation_price - totalPaid);
    
    // Si le statut calculé ne correspond pas au statut stocké, mettre à jour
    if ((isPaid && prestation.status !== 'paid') || (!isPaid && prestation.status !== 'not paid')) {
      const newStatus = isPaid ? 'paid' : 'not paid';
      await MedicalRecordPrestation.updateStatus(prestationId, newStatus);
      await paymentModel.updateAllPaymentsStatus(prestationId, newStatus);
      
      // Mise à jour du statut dans la réponse
      paiements.forEach(p => p.status = newStatus);
    }
    
    res.json({
      payments: paiements,
      totalPrice: prestation.prestation_price,
      totalPaid: totalPaid,
      remainingAmount: remainingAmount,
      status: isPaid ? 'paid' : 'not paid'
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des paiements :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  createPaiement,
  getPaiementsByPrestation
};