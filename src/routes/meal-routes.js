const express = require('express')
const logger = require('tracer').console();
const database = require('../config/database')
const mealController = require('../controllers/meal-controller')
const authenticationController = require('../controllers/authentication-controller')
const router = express.Router()

// UC-301 and UC-303
router.route('/:homeId/meal')
    .post(
        authenticationController.validateToken, 
        mealController.validateMeal, 
        mealController.create)
    .get(mealController.getAll)

// UC-302, UC-304 and UC-305
router.route('/:homeId/meal/:mealId')
    .put(
        authenticationController.validateToken, 
        mealController.validateMeal, 
        mealController.update)
    .get(mealController.getById)
    .delete(
        authenticationController.validateToken, 
        mealController.delete)

module.exports = router