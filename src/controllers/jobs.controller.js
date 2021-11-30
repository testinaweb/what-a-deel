const { unpaidJobs, jobById } = require('../repositories/job.repository');
const { profileById } = require('../repositories/profile.repository');
const HttpError = require('../httpError');

// GET /jobs/unpaid
const unpaidContracts = async (req, res) => {
  const profileId = req.profile.id;
  const jobs = await unpaidJobs(profileId);
  if (!jobs) {
    return res.status(404).end();
  }
  res.json(jobs.map(job => {
    job.paid = job.paid === null ? false : true;
    return job;
  }));
};

// POST /jobs/:job_id/pay
const payJob = async (req, res, next) => {
  const sequelize = req.app.get('sequelize');
  const profileId = req.profile.id;
  const jobId = req.params.job_id;

  const result = await sequelize.transaction(async (t) => {
    const options = { transaction: t };
    const jobWithDetails = await jobById(profileId, jobId, options)

    if (!jobWithDetails) {
      return next(new HttpError(404, 'No job found'));
    }

    if (jobWithDetails.paid) {
      return next(new HttpError(409, 'Job is already paid'));
    }

    const [client, contractor] = await Promise.all([
      profileById(profileId, options),
      profileById(jobWithDetails.Contract.ContractorId, options),
    ]);

    if (client.balance < jobWithDetails.price) {
      return next(new HttpError(400, 'Insufficient funds'));
    }

    // payment
    client.balance = client.balance - jobWithDetails.price;
    contractor.balance = contractor.balance + jobWithDetails.price;
    jobWithDetails.paid = true;
    jobWithDetails.paymentDate = new Date().toISOString();

    await Promise.all([
      client.save(options),
      contractor.save(options),
      jobWithDetails.save(options),
    ]);

    return jobWithDetails;
  });
  res.json(result.dataValues);
};

module.exports = { unpaidContracts, payJob };
