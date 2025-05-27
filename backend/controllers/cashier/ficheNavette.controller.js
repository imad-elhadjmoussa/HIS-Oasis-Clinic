const medicalRecordModel = require('../../models/cashier/medicalRecord.model');

exports.getUnbilled = async (req, res) => {
  try {
    const fiches = await medicalRecordModel.getUnbilledFiches();
    res.json(fiches);
  } catch (error) {
    console.error("Erreur lors de la récupération des fiches unbilled :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getById = async (req, res) => {
  try {
    const fiche = await medicalRecordModel.getFicheById(req.params.id);
    if (!fiche) {
      return res.status(404).json({ message: 'Fiche introuvable' });
    }
    res.json(fiche);
  } catch (error) {
    console.error("Erreur lors de la récupération de la fiche :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
