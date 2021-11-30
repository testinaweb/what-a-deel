const { Router } = require('express');
const { getProfile } = require('../middleware/getProfile.middleware');
const controllers = require('../controllers/controllers');
const router = new Router();

router.use(/\/((?!healthcheck).)*/, getProfile);

router.all('/healthcheck', (req, res) => res.send('OK'));
router.options('*', (req, res) => res.status(204).send());

// contracts
router.get('/contracts/', controllers.contracts.terminatedContractsByProfile);
router.get('/contracts/:id', controllers.contracts.contractByProfileAndId);

//jobs
router.get('/jobs/unpaid', controllers.jobs.unpaidContracts);
router.post('/jobs/:job_id/pay', controllers.jobs.payJob);

//balances
router.post('/balances/deposit/:userId', controllers.balances.depositToProfileId);

// admin
router.get('/admin/best-profession', controllers.admin.bestProfession);
router.get('/admin/best-clients', controllers.admin.bestClients);

module.exports = router;
