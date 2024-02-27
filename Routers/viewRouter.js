const express = require('express');
const viewControllers = require('./../controllers/viewControllers');
const router = express.Router();

router.get('/', viewControllers.getOverview);
router.get('/tour/:slug', viewControllers.getTour);
router.get('/login', viewControllers.getLoginForm);
module.exports = router;
