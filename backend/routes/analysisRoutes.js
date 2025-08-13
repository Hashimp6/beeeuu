const express = require('express');
const { bestsellingProduct, allCustomerDetails, bestCostomerTotelSpend, monthlySales, weeklySales, dailySales, costomerByCount } = require('../controllers/analysisController');
const router = express.Router();

router.get('/products/bestsellers/:storeId',bestsellingProduct)
router.get('/customers/details/:storeId',allCustomerDetails)
router.get('/customers/top-by-amount/:storeId',bestCostomerTotelSpend)
router.get('/customers/top-by-orders/:storeId',costomerByCount)
router.get('/sales/monthly/:storeId',monthlySales)
router.get('/sales/weekly/:storeId',weeklySales)
router.get('/sales/daily/:storeId',dailySales)
module.exports = router;