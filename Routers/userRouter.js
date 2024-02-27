const express = require('express');
const userControllers = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');
const router = express.Router();

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

//Protects all the routes after this middle-ware
router.use(authControllers.protect);

router.patch('/updatePassword/', authControllers.updatePassword);
router.patch('/deleteMe', userControllers.deleteMe);
router.patch('/updateMe', userControllers.updateMe);
router.route('/getMe').get(userControllers.getMe);
router.route('/').get(userControllers.getAllUsers);

module.exports = router;
