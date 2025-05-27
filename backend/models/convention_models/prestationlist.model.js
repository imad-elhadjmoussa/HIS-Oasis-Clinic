const db = require('../../db/connection');

// Get prestation list items based on the annex's specialty
const getPrestationListByAnnexId = async (annexId) => {
   const query = `
  SELECT
    PrestationList.id,
    PrestationList.prestation_name,
    PrestationList.prestation_code
  FROM PrestationList
  JOIN Annex
    ON PrestationList.specialty_id = Annex.specialty_id
  WHERE
    Annex.id = ?
    AND PrestationList.id NOT IN (
      SELECT PrestationPrice.prestation_list_id
      FROM PrestationPrice
      WHERE
        PrestationPrice.annex_id = ?
        AND PrestationPrice.updated_by_id IS NULL
    )
`;

    const [rows] = await db.execute(query, [annexId, annexId]); // pass twice
    return rows;
};



// Get prestation list items based on the avenant
const getPrestationListByAvenantId = async (avenantId) => {
  const query = `
 SELECT
   PrestationList.id,
   PrestationList.prestation_name,
   PrestationList.prestation_code
 FROM PrestationList
 WHERE
   PrestationList.id NOT IN (
     SELECT PrestationPrice.prestation_list_id
     FROM PrestationPrice
     WHERE
       PrestationPrice.avenant_id = ?
   )
`;
   const [rows] = await db.execute(query, [avenantId]); // pass once since we only have one parameter
   return rows;
};

module.exports = {
    getPrestationListByAnnexId,
    getPrestationListByAvenantId
};
