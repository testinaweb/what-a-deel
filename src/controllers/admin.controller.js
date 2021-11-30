const { mostPaidjobs, mostPaidProfession } = require('../repositories/job.repository');
const HttpError = require('../httpError');

// GET /admin/best-profession?start=<date>&end=<date> - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
const bestProfession = async (req, res, next) => {
  const { startDate, endDate } = dateValidator(req, next);

  const profession = (await mostPaidProfession(startDate, endDate))?.get({ plain: true });
  if (profession === undefined) {
    return next(new HttpError(404, 'Profession not found'));
  }
  res.json({
    profession: profession.Contract.Contractor.profession,
    totalPaid: profession.totalPaid
  });
}

// GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>
const bestClients = async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 2;
  const { startDate, endDate } = dateValidator(req, next);

  const result = await mostPaidjobs(startDate, endDate, limit);

  res.json(
    result.map(job => ({
        id: job.Contract.ClientId,
        fullName: `${job.Contract.Client.firstName} ${job.Contract.Client.lastName}`,
        paid: job.dataValues.totalPaid
      })
    )
  );
}

// [private] utility function
const dateValidator = (req, next) => {
  const regex = /[\d]{4}-[\d]{2}-[\d]{2}/;
  const { start, end } = req.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (!start.match(regex) || !end.match(regex) || startDate == 'Invalid Date' || endDate == 'Invalid Date') {
    return next(new HttpError(400, 'Dates are not valid, use YYYY-MM-DD format'));
  }
  return { startDate, endDate };
}

module.exports = { bestProfession, bestClients };
