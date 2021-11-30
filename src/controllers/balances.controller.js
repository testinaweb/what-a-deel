const { unpaidJobsSumByClientId } = require('../repositories/job.repository');
const { profileById } = require('../repositories/profile.repository');
const HttpError = require('../httpError');

// POST /balances/deposit/:userId
const depositToProfileId = async (req, res, next) => {
  const profileId = req.profile.id;
  const { amount } = req.body;
  const sequelize = req.app.get('sequelize');

  const result = await sequelize.transaction(async (t) => {
    const options = { transaction: t };

    const profile = await profileById(profileId, options);

    if (!profile || profile.type !== 'client') {
      return next(new HttpError(404, 'Profile not found'));
    }

    const unpaidSum = await unpaidJobsSumByClientId(profileId, options);
    if (amount > unpaidSum * 0.25) {
      return next(new HttpError(400, 'Deposit exceeds the limit'));
    }

    profile.balance = parseFloat((profile.balance + amount).toFixed(2));

    await profile.save(options);
    return profile;
  });

  res.json(result.dataValues);
}

module.exports = { depositToProfileId };

