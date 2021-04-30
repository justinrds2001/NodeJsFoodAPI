const express = require('express')
const logger = require('tracer').console();
const database = require('../dao/database')
const studenthomeController = require('../controllers/studenthome-controller')
const router = express.Router()

// Logger endpoint
  
// UC-201 en UC-202
router.route('/')
    .post(studenthomeController.create)
    .get(studenthomeController.getAll)
  
// UC-203, UC-204 en UC-205 (concept)
router.route('/:homeId')
    .get(studenthomeController.getById)
    .put(studenthomeController.update)
    .delete(studenthomeController.delete)
  
// UC-206 Gebruiker toevoegen aan studentenhuis (concept)
router.put('/:homeId/user', studenthomeController.addUser)

module.exports = router