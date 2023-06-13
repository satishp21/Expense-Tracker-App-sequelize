const express = require('express');

const premiumFeatureController = require('../controller/premiumFeature');

const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/showLeaderBoard', authenticatemiddleware.authenticate,premiumFeatureController.getUserLeaderBoard);
router.get('/showdownloadedfiles', authenticatemiddleware.authenticate,premiumFeatureController.getUrldownloadfiles);

module.exports = router;