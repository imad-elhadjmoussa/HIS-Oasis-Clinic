//prestation.controllers
const prestationModel = require("../../models/cashier/prestation.model");

exports.getByFicheId = async (req, res) => {
  const ficheId = req.params.ficheId;

  try {
    const prestations = await prestationModel.getPrestationsByMedicalRecordId(ficheId);
    res.json(prestations);
  } catch (err) {
    console.error("Erreur lors de la récupération des prestations par fiche :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.updateMontantPaye = async (req, res) => {
  const prestationId = req.params.id;
  const { montant } = req.body;

  try {
    await prestationModel.updateAmountPaid(prestationId, montant);
    await prestationModel.updateStatusAuto(prestationId);

    res.json({ success: true, message: "Montant payé et statut mis à jour automatiquement" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.updatePrice = async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  try {
    await prestationModel.updatePrice(id, price);
    res.json({ message: 'Prix mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prix :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

