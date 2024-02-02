const express = require('express');
const userControllers = require('./../controllers/userControllers');

const router = express.Router();

router
  .route('/')
  .get(userControllers.getAllUsers);

router.route('/:id').get(userControllers.getUser);

module.exports = router;
