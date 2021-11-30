const { Op, fn, col } = require('sequelize');
const { Contract, Job, Profile } = require('../model');

const unpaidJobs = (profileId) => {
  return Job.findAll({
    where: { paid: null },
    include: [
      {
        model: Contract,
        required: true,
        attributes: [],
        where: {
          [Op.or]: [
            { ContractorId: profileId },
            { ClientId: profileId }
          ],
          status: ['new', 'in_progress']
        }
      }
    ]
  });
};

const jobById = (profileId, id, options = {}) => {
  return Job.findOne(
    {
      where: { id },
      include: [
        {
          model: Contract,
          required: true,
          attributes: ['ContractorId'],
          where: {
            [Op.or]: [
              { ContractorId: profileId },
              { ClientId: profileId }
            ]
          }
        }
      ]
    },
    options
  );
};

const unpaidJobsSumByClientId = (profileId, options = {}) => {
  return Job.sum('price', {
    where: { paid: null },
    include: [
      {
        model: Contract,
        required: true,
        attributes: [],
        where: {
          status: 'in_progress',
          ClientId: profileId
        }
      }
    ]
  }, options);
};

const mostPaidjobs = (startDate, endDate, limit = 2) => {
  return Job.findAll({
    attributes: [[fn('sum', col('price')), 'totalPaid']],
    order: [[fn('sum', col('price')), 'DESC']],
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [{
      model: Contract,
      include: [{
        model: Profile,
        as: 'Client',
        where: { type: 'client' },
        attributes: ['firstName', 'lastName']
      }],
      attributes: ['ClientId']
    }],
    group: 'Contract.ClientId',
    limit: limit
  });
};

const mostPaidProfession = (startDate, endDate) => {
  return Job.findOne({
    attributes: [[fn('sum', col('price')), 'totalPaid']],
    order: [[fn('sum', col('price')), 'DESC']],
    group: ['Contract.Contractor.profession'],
    limit: 1,
    where: {
      paid: true,
      createdAt: {
        [Op.between]: [startDate, endDate],
      }
    },
    include: [
      {
        model: Contract,
        attributes: ['createdAt'],
        include: [{
          model: Profile,
          as: 'Contractor',
          where: { type: 'contractor' },
          attributes: ['profession'],
        }]
      }
    ]
  });
};

module.exports = { unpaidJobs, jobById, unpaidJobsSumByClientId, mostPaidjobs, mostPaidProfession };
