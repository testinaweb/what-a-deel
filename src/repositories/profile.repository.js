const { Profile } = require('../model');

const profileById = (profileId, options = {}) => {
  return Profile.findOne(
    { where: { id: profileId } },
    options
  );
};

module.exports = { profileById };

