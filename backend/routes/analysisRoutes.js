const express = require('express');
const router = express.Router();

router.get('/revenue/:storeId', getStoreRevenue);

module.exports = router;