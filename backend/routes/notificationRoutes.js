const express = require('express');
const router = express.Router();
const { updatePushToken } = require('../controllers/notificationController');

router.put('/update-push-token',  updatePushToken);

module.exports = router;