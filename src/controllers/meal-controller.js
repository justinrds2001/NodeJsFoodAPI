const database = require("../dao/database");
const logger = require('tracer').console();

module.exports = {
    create: (req, res, next) => {
        const studenthomeId = req.params.homeId
        let studenthome = database.getStudentHomeById(studenthomeId)
        let meal = req.body
        if (studenthome) {
            database.addMeal(studenthome, meal, (err, result) => {
                if (err) {
                    logger.log('Error adding meal ', meal);
                    next({ message: 'meal-controller.addMeal is not implemented yet', errorCode: 501 });
                }
                if (result) {
                    res.status(200).json({ status: 'success', result: result });
                }
            })
        } else {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
        }
    },

    getAll: (req, res, next) => {
        const studenthomeId = req.params.homeId
        let studenthome = database.getStudentHomeById(studenthomeId)
        if (studenthome) {
            res.status(200).json({ status: 'success', result: studenthome.meals });
        } else {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
        }
    },

    update: (req, res, next) => {
        const studenthomeId = req.params.homeId
        const mealId = req.params.mealId
        const meal = database.getMealByHomeId(mealId, studenthomeId)
        const newMeal = req.body
        newMeal.id = parseInt(mealId)
        let studenthome = database.getStudentHomeById(studenthomeId)
        studenthome.meals.splice(studenthome.meals.indexOf(meal), 1, newMeal)
        if (studenthome && meal) {
            res.status(200).json({ status: 'success', result: newMeal });
        } else {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
        }
    },

    getById: (req, res, next) => {
        const studenthomeId = req.params.homeId
        const mealId = req.params.mealId
        const meal = database.getMealByHomeId(mealId, studenthomeId)
        if (meal) {
            res.status(200).json({ status: 'success', result: meal });
        } else {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
        }
    },

    delete: (req, res, next) => {
        const studenthomeId = req.params.homeId
        const mealId = req.params.mealId
        const meal = database.removeMealFromHome(mealId, studenthomeId)
        if (meal) {
            res.status(200).json({ status: 'success', result: meal });
        } else {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
        }
    }
}