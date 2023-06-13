const express = require('express');

const userController = require('../controller/user');

const expenseController = require('../controller/expense')

const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', userController.signup);

router.post('/login', userController.login)

router.get('/download', authenticatemiddleware.authenticate, expenseController.downloadExpenses)

module.exports = router;