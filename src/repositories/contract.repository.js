const { Op } = require('sequelize');
const { Contract } = require('../model');

const contractsByProfile = (profileId, terminated = true) => {
  return Contract.findAll({where: {
    status: terminated ? 'terminated' : ['new', 'in_progress'],
    [Op.or]: [
      { ContractorId: profileId },
      { ClientId: profileId }
    ]
  }});
}

const contractById = (profileId, contractId) => {
  return Contract.findOne({where: {
    id: contractId,
    [Op.or]: [
      { ContractorId: profileId },
      { ClientId: profileId }
    ]
  }});
};

module.exports = { contractById, contractsByProfile };
