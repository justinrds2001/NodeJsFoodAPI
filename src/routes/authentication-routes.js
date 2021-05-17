const express = require('express')
const logger = require('tracer').console()
const router = express.Router()
const authenticatorController = require('../controllers/authentication-controller')
const emailValidator = require('../util/emailvalidator')

router.post('/login', 
    authenticatorController.validateLogin, 
    authenticatorController.login)
router.post('/register',
    emailValidator.
    authenticatorController.validateRegister,
    authenticatorController.register
)
// router.get('/validate', authenticatorController.validateToken, authenticatorController.renewToken)

module.exports = router