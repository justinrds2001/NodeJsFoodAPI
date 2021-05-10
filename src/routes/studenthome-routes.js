const express = require('express')
const logger = require('tracer').console();
const database = require('../dao/database')
const studenthomeController = require('../controllers/studenthome-controller')
const router = express.Router()

// Logger endpoint
  
// UC-201 and UC-202
router.route('/')
    .post(studenthomeController.validateStudenthomePlace, studenthomeController.validateStudenthome, studenthomeController.create)
    .get(studenthomeController.getAll)
  
// UC-203, UC-204 and UC-205
router.route('/:homeId')
    .get(studenthomeController.getById)
    .put(studenthomeController.validateStudenthome, studenthomeController.update)
    .delete(studenthomeController.delete)
  
// UC-206 Gebruiker toevoegen aan studentenhuis
router.put('/:homeId/user', studenthomeController.addUser)

module.exports = router