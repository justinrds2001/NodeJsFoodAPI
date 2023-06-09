const express = require('express')
const logger = require('tracer').console();
const database = require('../config/database')
const studenthomeController = require('../controllers/studenthome-controller')
const authenticatorController = require('../controllers/authentication-controller')
const router = express.Router()

// Logger endpoint
  
// UC-201 and UC-202
router.route('/')
    .post(
        authenticatorController.validateToken, 
        studenthomeController.validateStudenthome, 
        studenthomeController.create)
    .get(studenthomeController.getAll)
  
// UC-203, UC-204 and UC-205
router.route('/:homeId')
    .get(studenthomeController.getById)
    .put(
        authenticatorController.validateToken, 
        studenthomeController.validateStudenthome, 
        studenthomeController.update)
    .delete(
        authenticatorController.validateToken,
        studenthomeController.delete)
  
// UC-206 Gebruiker toevoegen aan studentenhuis
router.put('/:homeId/user', studenthomeController.addUser)

module.exports = router