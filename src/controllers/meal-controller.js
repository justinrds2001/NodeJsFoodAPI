const assert = require("assert");
const database = require("../config/database");
const config = require('../config/config');
const pool = require("../config/database");
const logger = require('tracer').console();
const jwt = require('jsonwebtoken')

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
        const authHeader = req.headers.authorization

        // Retrieving UserID from json webtoken
        const token = authHeader.substring(7, authHeader.length)
        const decoded = jwt.verify(token, 'secret')
        const UserID = decoded.id

        logger.log('UserID: '+ UserID)

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
        const studenthomeID = req.params.homeId
        const mealId = req.params.mealId
        const { Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, MaxParticipants} = req.body
        const values = [Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, MaxParticipants, mealId]

        const authHeader = req.headers.authorization

        // Retrieving UserID from json webtoken
        const token = authHeader.substring(7, authHeader.length)
        const decoded = jwt.verify(token, 'secret')
        const userID = decoded.id

        const sqlStudenthomeQuery = 'select UserID from studenthome where ID = ' + studenthomeID

        const sqlUpdateQuery = 'update meal ' +
        'set Name = ?, Description = ?, Ingredients = ?, Allergies = ?, CreatedOn = ?, OfferedOn = ?, Price = ?, MaxParticipants = ? ' +
        'where ID = ?'

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlStudenthomeQuery, (error, results) => {
                    if (error) {
                        next({ message: 'update failed', errorCode: 500 })
                    }

                    if (results){
                        if (results[0].UserID == parseInt(userID)){
                            connection.query(sqlUpdateQuery, values, (error, updateResults) => {
                                connection.release()
                                if (error) {
                                    next({ message: 'update failed', errorCode: 500 })
                                }

                                if (updateResults) {
                                    res.status(200).json({
                                        status: 'successful',
                                        editedItem: results[0]
                                    })
                                }

                            })
                        } else{
                            next({ message: 'wrong userID / not authorized', errorCode: 400 }) 
                        }
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
        const mealID = req.params.mealId
        const sqlDeleteQuery = 'delete from meal where ID = ?'
        const sqlInfoQuery = 'select * from meal where ID = ?'
        let meal

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlInfoQuery, mealID, (err, results, fields) => {
                    if (err) {
                        next({ message: 'getById failed', errorCode: 500 })
                    }
                    if (results) {
                        logger.trace('results: ', results)
                        meal = results[0]

                        connection.query(sqlDeleteQuery, mealID, (err, results, fields) => {
                            if (err) {
                                next({ message: 'delete failed', errorCode: 500 })
                            }
                            if (results) {
                                res.status(200).json({
                                    status: 'successful',
                                    deletedItem: meal
                                })
                            }
                        })
                    }
                })
            }
        })
    },
}