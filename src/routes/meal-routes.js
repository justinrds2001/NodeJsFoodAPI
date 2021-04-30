const express = require('express')
const logger = require('tracer').console();
const database = require('../dao/database')
const mealController = require('../controllers/meal-controller')
const router = express.Router()

// UC-301 and UC-303
router.route('/:homeId/meal')
    .post(mealController.create)
    .get(mealController.getAll)

// UC-302, UC-304 and UC-305
router.route('/:homeId/meal/:mealId')
    .put(mealController.update)
    .get(mealController.getById)
    .delete(mealController.delete)

module.exports = router