const assert = require("assert");
const database = require("../config/database");
const config = require('../config/config');
const pool = require("../config/database");
const logger = require('tracer').console();

module.exports = {
    validateMeal: (req, res, next) => {
        logger.log("validate movie");
        logger.log(req.body);
        try {
            const { Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, MaxParticipants} = req.body
            assert(typeof Name === 'string', 'name is missing!')
            assert(typeof Description === 'string', 'description is missing!')
            assert(typeof Ingredients === 'string', 'ingredients are missing!')
            assert(typeof Allergies === 'string', 'allergies are missing!')
            assert(typeof CreatedOn === 'string', 'created on is missing!')
            assert(typeof OfferedOn === 'string', 'offered on info is missing')
            assert(typeof Price === 'number', 'price is missing!')
            assert(typeof MaxParticipants === 'number', 'max participants are missing!')
            next()
        } catch (err) {
            logger.log("Meal data is invalid!: ", err.message);
            next({ message: err.message, errorCode: 400 });
        }
    },

    create: (req, res, next) => {
        logger.info('create called')
        const meal = req.body
        let {Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, MaxParticipants} = meal
        const studenthomeID = req.params.homeId
        const UserID = 1

        let values = [Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, UserID, studenthomeID, MaxParticipants]
        logger.trace('movie =', meal)

        let sqlQuery = 'INSERT INTO meal(Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, UserID, StudenthomeID, MaxParticipants) ' +
        'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        logger.debug('create', 'sqlQuery =', sqlQuery)

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlQuery, values, (err, results, fields) => {
                    connection.release
                    if (err) {
                        next({ message: 'create failed', errorCode: 500 })
                    }
                    if (results) {
                        logger.trace('results: ', results)
                        res.status(200).json({
                            status: 'success',
                            result: meal
                        })
                    }
                })
            }
        })
    },

    getAll: (req, res, next) => {
        logger.trace('getAll called')

        const studenthomeId = req.params.homeId
        const sqlQuery = 'select * from meal where StudenthomeID = ?'
        
        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlQuery, studenthomeId, (err, results) => {
                    if (err) { 
                        next({ message: 'getAll failed', errorCode: 500 })
                    }
                    if (results) {
                        res.status(200).json({
                            status: 'successful',
                            result: results
                        })
                    }
                })
            }
        })
    },

    update: (req, res, next) => {
        const studenthomeId = req.params.homeId
        const mealId = req.params.mealId
        const { Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, MaxParticipants} = req.body
        const values = [Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, MaxParticipants, mealId]
        const sqlUpdateQuery = 'update meal ' +
        'set Name = ?, Description = ?, Ingredients = ?, Allergies = ?, CreatedOn = ?, OfferedOn = ?, Price = ?, MaxParticipants = ?'
        'where ID = ?'
        const sqlInfoQuery = 'select * from studenthome where ID = ?'

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlUpdateQuery, values, (err, results) => {
                    if (err) {
                        next({ message: 'update failed', errorCode: 500 })
                    }
                    if (results) {
                        connection.query(sqlInfoQuery, studenthomeId, (err, results) => {
                            if (err) {
                                next({ message: 'update failed', errorCode: 500 })
                            }
                            if (results) {
                                res.status(200).json({
                                    status: 'successful',
                                    editedItem: results[0]
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    getById: (req, res, next) => {
        const mealId = req.params.mealId
        const sqlQuery = 'select * from meal where ID = ?'

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlQuery, mealId, (err, results) => {
                    if (err) {
                        next({ message: 'getById failed', errorCode: 500 })
                    }
                    if (results) {
                        res.status(200).json({
                            status: 'successful',
                            result: results[0]
                        })
                    }
                })
            }
        })
    },

    delete: (req, res, next) => {
        logger.trace('delete called')
        const studenthomeID = req.params.homeId
        const sqlDeleteQuery = 'delete from studenthome where ID = ?'
        const sqlInfoQuery = 'select * from studenthome where ID = ?'
        let studenthome

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlInfoQuery, studenthomeID, (err, results, fields) => {
                    if (err) {
                        next({ message: 'getById failed', errorCode: 500 })
                    }
                    if (results) {
                        logger.trace('results: ', results)
                        studenthome = results[0]

                        connection.query(sqlDeleteQuery, studenthomeID, (err, results, fields) => {
                            if (err) {
                                next({ message: 'delete failed', errorCode: 500 })
                            }
                            if (results) {
                                res.status(200).json({
                                    status: 'successful',
                                    deletedItem: studenthome
                                })
                            }
                        })
                    }
                })
            }
        })
    },
}