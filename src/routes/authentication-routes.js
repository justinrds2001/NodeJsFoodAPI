const express = require('express')
const logger = require('tracer').console()
const router = express.Router()
const authenticatorController = require('../controllers/authentication-controller')

router.post('/login', 
    authenticatorController.validateLogin, 
    authenticatorController.login)
router.post('/register',
    authenticatorController.validateRegister,
    authenticatorController.register
)
// router.get('/validate', authenticatorController.validateToken, authenticatorController.renewToken)

module.exports = router