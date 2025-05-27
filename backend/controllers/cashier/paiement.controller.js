const paymentModel = require("./../../models/cashier/payment.model");
const prestationModel = require("../../models/cashier/prestation.model");

// Créer un paiement et mettre à jour automatiquement le statut
exports.createPaiement = async (req, res) => {
  const { amount_paid, prestation_id } = req.body;
  console.log("🔔 Paiement reçu :", { amount_paid, prestation_id });

  try {
    // 1. Récupérer la prestation pour connaître son prix original
    const prestation = await prestationModel.getPrestationById(prestation_id);
    
    if (!prestation) {
      return res.status(404).json({ message: "Prestation non trouvée" });
    }

    // 2. Enregistrer le paiement avec statut initial 'unpaid'
    await paymentModel.createPayment({ 
      amount_paid, 
      prestation_id,
      status: 'unpaid'
    });

    // 3. Calculer le total payé pour cette prestation
    const totalPaid = await paymentModel.getTotalPaidByPrestation(prestation_id);
    console.log(`Prestation #${prestation_id} - Prix: ${prestation.prestation_price}, Total payé: ${totalPaid}`);

    // 4. Vérifier si la prestation est payée
    const isPaid = Math.round(totalPaid * 100) >= Math.round(prestation.prestation_price * 100);
    console.log(`Est payée ? ${isPaid} (${totalPaid} >= ${prestation.prestation_price})`);

    // 5. Mettre à jour le statut de paiement
    const newStatus = isPaid ? 'paid' : 'unpaid';
    await paymentModel.updateAllPaymentsStatus(prestation_id, newStatus);
    await prestationModel.updateStatus(prestation_id, newStatus);

    // 6. Calcul du reste à payer
    const remainingAmount = Math.max(0, prestation.prestation_price - totalPaid);

    res.status(201).json({ 
      message: "Paiement enregistré avec succès", 
      status: newStatus,
      remainingAmount: remainingAmount
    });

  } catch (err) {
    console.error("Erreur lors de l'enregistrement du paiement :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Obtenir l’historique des paiements pour une prestation
exports.getPaiementsByPrestation = async (req, res) => {
  const prestationId = req.params.id;

  try {
    const paiements = await paymentModel.getPaiementsByPrestation(prestationId);
    const prestation = await prestationModel.getPrestationById(prestationId);
    
    if (!prestation) {
      return res.status(404).json({ message: "Prestation non trouvée" });
    }

    const totalPaid = paiements.reduce((sum, payment) => sum + parseFloat(payment.amount_paid), 0);
    const isPaid = Math.round(totalPaid * 100) >= Math.round(prestation.prestation_price * 100);
    const newStatus = isPaid ? 'paid' : 'unpaid';
    const remainingAmount = Math.max(0, prestation.prestation_price - totalPaid);

    if (prestation.payment_status !== newStatus) {
      await prestationModel.updateStatus(prestationId, newStatus);
      await paymentModel.updateAllPaymentsStatus(prestationId, newStatus);
      paiements.forEach(p => p.status = newStatus);
    }

    res.json({
      payments: paiements,
      totalPrice: prestation.prestation_price,
      totalPaid,
      remainingAmount,
      status: newStatus
    });

  } catch (err) {
    console.error("Erreur lors de la récupération des paiements :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
