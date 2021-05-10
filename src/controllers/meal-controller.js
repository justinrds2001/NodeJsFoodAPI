const database = require("../dao/database");
const logger = require('tracer').console();
const assert = require("assert");

module.exports = {
    validateMeal(req, res, next) {
        console.log("validate movie");
        console.log(req.body);
        try {
            const { name, description, addedAt, offeredAt, price, allergyInfo, ingredients} = req.body
            assert(typeof name === 'string', 'name is missing!')
            assert(typeof description === 'string', 'description is missing!')
            assert(typeof addedAt === 'string', 'added at is missing!')
            assert(typeof offeredAt === 'string', 'offered at is missing!')
            assert(typeof price === 'string', 'price is missing!')
            assert(typeof allergyInfo === 'string', 'allergy info is missing')
            assert(typeof ingredients === 'object', 'ingredients are missing!')
            next()
        } catch (err) {
            console.log("Meal data is invalid!: ", err.message);
            next({ message: err.message, errorCode: 400 });
        }
    },

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
            next({message: 'item not found', errorCode: 404})
        }
    },

    getAll: (req, res, next) => {
        const studenthomeId = req.params.homeId
        let studenthome = database.getStudentHomeById(studenthomeId)
        if (studenthome) {
            res.status(200).json({ status: 'success', result: studenthome.meals });
        } else {
            logger.log('item was not found')
            next({message: 'item not found', errorCode: 404})
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
            res.status(200).json({ status: 'success', result: studenthome });
        } else {
            logger.log('item was not found')
            next({message: 'item not found', errorCode: 404})
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
            next({message: 'item not found', errorCode: 404})
        }
    },

    delete: (req, res, next) => {
        const studenthomeId = req.params.homeId
        const mealId = req.params.mealId
        const meal = database.removeMealFromHome(mealId, studenthomeId)
        if (meal) {
            const studenthome = database.getStudentHomeById(studenthomeId)
            res.status(200).json({ status: 'success', result: studenthome });
        } else {
            logger.log('item was not found')
            next({message: 'item not found', errorCode: 404})
        }
    }
}