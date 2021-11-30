const { contractById, contractsByProfile } = require('../repositories/contract.repository');

// GET /contracts
const terminatedContractsByProfile = async (req, res) => {
  const profileId = req.profile.id;
  const contracts = await contractsByProfile(profileId);
  if (!contracts) {
    return res.status(404).end();
  }
  res.json(contracts);
};

// GET /contracts/:id
const contractByProfileAndId = async (req, res) => {
  const {id} = req.params;
  const profileId = req.profile.id;
  const contract = await contractById(profileId, id);
  if (!contract) {
    return res.status(404).end();
  }
  res.json(contract);
};

module.exports = { terminatedContractsByProfile, contractByProfileAndId };
