//entreprise.controller
const { getEntreprisesWithNonFacturedCount } = require('../../models/facturation_models/entreprise.model.js');

const getEntreprises = async (req, res) => {
  try {
    const data = await getEntreprisesWithNonFacturedCount();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};


module.exports = {
  getEntreprises
};
