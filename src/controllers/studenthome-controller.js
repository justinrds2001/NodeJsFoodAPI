const assert = require("assert");
const express = require('express')
const database = require("../config/database");
const config = require('../config/config');
const pool = require("../config/database");
const logger = require('tracer').console();
const jwt = require('jsonwebtoken')

module.exports = {
    // validateStudenthomePlace(req, res, next) {
    //     try {
    //         assert(!database.homeDoesAlreadyExist(req.body), 'studenthome already exists')
    //         next()
    //     } catch (err) {
    //         logger.log("Studenthome already exists!: ", err.message)
    //         next({ message: err.message, errorCode: 400 })
    //     }
    // },

    validateStudenthome: (req, res, next) => {
        logger.log("validate movie");
        logger.log(req.body);
        try {
            const { Name, Address, House_Nr, Postal_Code, Telephone, City} = req.body
            assert(typeof Name === 'string', 'name is missing!')
            assert(typeof Address === 'string', 'street name is missing!')
            assert(typeof House_Nr === 'number', 'house number is missing!')
            assert(typeof Postal_Code === 'string', 'postal code is missing!')
            assert.match(Postal_Code, /[1-9]{1}[0-9]{3}[A-Z]{2}/, 'postal code is invalid!')
            assert(typeof Telephone === 'string', 'phone number is missing')
            assert.match(Telephone, /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, 'phone number is invalid!')
            assert(typeof City === 'string', 'city is missing!')
            next()
        } catch (err) {
            logger.log("Studenthome data is invalid!: ", err.message)
            next({ message: err.message, errorCode: 400 })
        }
    },

    create: (req, res, next) => {
        logger.info('create called')
        const studenthome = req.body
        let {Name, Address, House_Nr, Postal_Code, Telephone, City} = studenthome
        const authHeader = req.headers.authorization

        // Retrieving UserID from json webtoken
        const token = authHeader.substring(7, authHeader.length)
        const decoded = jwt.verify(token, 'secret')
        const UserID = decoded.id

        logger.log('UserID: '+ UserID)

        let values = [ Name, Address, House_Nr, UserID, Postal_Code, Telephone, City ]
        logger.trace('movie =', studenthome)

        let sqlQuery = 'insert into studenthome(Name, Address, House_Nr, UserID, Postal_Code, Telephone, City) ' +
        'values(?, ?, ?, ?, ?, ?, ?)'
        logger.debug('create', 'sqlQuery =', sqlQuery)

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlQuery, values, (err, results, fields) => {
                    connection.release()
                    if (err) {
                        next({ message: 'studenthome is invalid or already exists', errorCode: 400 })
                    }
                    if (results) {
                        logger.trace('results: ', results)
                        studenthome.ID = results.insertId
                        res.status(200).json({
                            status: 'successful',
                            result: studenthome
                        })
                    }
                })
            }
        })
    },

    getAll: (req, res, next) => {
        logger.trace('getAll called')

        let sqlQuery = 
            'select * ' +
            'from studenthome'

        // filtering by query params
        const queryParams = Object.entries(req.query)
        logger.info('queryParams:', queryParams)
        if (queryParams.length > 0) {
            let queryString = queryParams
              .map((param) => {
                // map maakt een nieuwe waarde van gegeven invoer; hier een string van twee arrayvalues.
                return `${param[0]} = '${param[1]}'`
              })
              .reduce((a, b) => {
                // reduce 'reduceert' twee opeenvolgende waarden tot één eindwaarde.
                return `${a} AND ${b}`
              })
            logger.info('queryString:', queryString)
            sqlQuery += ` where ${queryString};`
        }
        logger.debug('getAll', 'sqlQuery =', sqlQuery)

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlQuery, (err, results, fields) => {
                    connection.release()
                    if (err) {
                        next({ message: 'GetAll failed', errorCode: 500 })
                    }
                    if (results) {
                        logger.trace('results: ', results)
                        // const mappedResults = results.map( item =>  {
                        //     return {
                        //         ...item
                        //     }
                        // })
                        res.status(200).json({
                            status: 'successful',
                            result: results
                        })
                    } 
                })
            }
        })
    },

    getById: (req, res, next) => {
        logger.trace('getById called')

        const sqlStudenthomeQuery = 'select * from studenthome where ID = ?'
        const sqlMealQuery = 'select ID, Name from meal where StudenthomeID = ?'
        const studenthomeID = req.params.homeId

        let studenthome

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlStudenthomeQuery, studenthomeID, (err, results, fields) => {
                    if (err) {
                        next({ message: 'getById failed', errorCode: 500 })
                    }
                    if (results) {
                        logger.trace('results: ', results)
                        if (results.length === 0) {
                            next({message: 'id was not found', errorCode: 404})
                        } else {
                            studenthome = results[0]

                            connection.query(sqlMealQuery, studenthomeID, (err, results, fields) => {
                                if (err) {
                                    next({ message: 'getById failed', errorCode: 500 })
                                }
                                if (results) {
                                    logger.trace('results: ', results)
                                    studenthome.Meals = results
                                    res.status(200).json({status: 'successful', result: studenthome})
                                }
                            })
                        }
                    }
                })
            }
        })
    },

    update: (req, res, next) => {
        const studenthomeID = req.params.homeId
        let {Name, Address, House_Nr, Postal_Code, Telephone, City} = req.body
        let values = [Name, Address, House_Nr, Postal_Code, Telephone, City, studenthomeID]

        const authHeader = req.headers.authorization

        // Retrieving UserID from json webtoken
        const token = authHeader.substring(7, authHeader.length)
        const decoded = jwt.verify(token, 'secret')
        const userID = decoded.id

        const sqlStudenthomeQuery = 'select UserID from studenthome where ID = ' + studenthomeID

        const sqlQuery = 'update studenthome ' +
            'set Name = ?, Address = ?, House_Nr = ?, Postal_Code = ?, Telephone = ?, City = ? ' +
            'where ID = ?'


        pool.getConnection((err, connection) => {
            if(err){
                logger.log(err)
                next ({message: 'update failed', errorCode: 500 })
            }

            if (connection){
                connection.query(sqlStudenthomeQuery, values, (error, results) => {
                    if (error) {
                        next({ message: 'update failed', errorCode: 500 }) 
                    }
                    if (results){
                        if (results[0].UserID == userID) {
                            connection.query(sqlQuery, values, (error, results) => {
                                connection.release()
                                if (error) {    
                                    next({ message: 'update failed', errorCode: 500 })
                                }
                                if (results){
                                    let studenthome = req.body
                                    studenthome.ID = parseInt(studenthomeID)
                                    res.status(200).json({
                                        status: 'successfull',
                                        editedItem: studenthome
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

    addUser: (req, res, next) => {
        // not implemented yet
        const id = req.params.homeId
        const studenthome = database.getStudentHomeById(id)
        logger.log(`id: ${id}  studenthome: ${studenthome}`)

        next({message: 'addUser not implemented yet', errorCode: 501})
    }
}