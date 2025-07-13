const express = require('express');
const router = express.Router();
const { updatePushToken, removePushToken } = require('../controllers/notificationController');

router.put('/update-push-token',  updatePushToken);
router.post("/remove-token", removePushToken);

module.exports = router;