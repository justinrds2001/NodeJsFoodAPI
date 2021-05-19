const assert = require('assert')
const jwt = require('jsonwebtoken')
const pool = require('../config/database')
const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey

module.exports = {

    validateRegister: (req, res, next) => {
        logger.log("validate user")
        logger.log(req.body)
        const { First_Name, Last_Name, Email, Student_Number, Password} = req.body
        try {
            assert(typeof First_Name === 'string', 'first name is missing!')
            assert(typeof Last_Name === 'string', 'last name is missing!')
            assert(typeof Email === 'string', 'email is missing!')
            assert.match(Email, /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/, 
            'email is invalid!')
            assert(typeof Student_Number === 'string', 'student number is missing!')
            assert(typeof Password === 'string', 'password is missing!')
            assert(Password.length >= 8, 'password needs to be atleast 8 characters!')
            next()
        } catch (err) {
            logger.log("User data is invalid!: ", err.message);
            next({ message: err.message, errorCode: 400 });
        }
    },

    register: (req, res, next) => {
        logger.log("register")
        logger.log(req.body)

        const {First_Name, Last_Name, Email, Student_Number, Password} = req.body
        const values = [ First_Name, Last_Name, Email, Student_Number, Password ]
        const sqlQuery = 'insert into user (First_Name, Last_Name, Email, Student_Number, Password) ' 
        + 'values (?, ?, ?, ?, ?)' 

        pool.getConnection((err, connection) => {
            if (err) {
                logger.log(err)
                next({ message: 'connection failed', errorCode: 500 })
            }
            if (connection) {
                connection.query(sqlQuery, values, (err, results, fields) => {
                    if (err) {
                        next({ message: 'user already exists!', errorCode: 400 })
                    }
                    if (results) {
                        logger.trace('results: ', results)
                        
                        const payload = {
                            id: results.insertId
                        }
                        const userinfo = {
                            id: results.insertId,
                            First_Name: First_Name,
                            Last_Name: Last_Name,
                            Email: Email,
                            Token: jwt.sign(payload, jwtSecretKey, { expiresIn: '2h' })
                        }
                        logger.debug('Registered', userinfo)
                        res.status(200).json(userinfo)
                    }
                })
            }
        })
    },

    validateLogin: (req, res, next) => {
        logger.log("validate user")
        logger.log(req.body)
        const { Email, Password} = req.body
        try {
          assert(typeof Email === 'string', 'email is missing!')
          assert.match(Email, /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/, 
            'email is invalid!')
          assert(typeof Password === 'string', 'password is missing!')
          assert(Password.length >= 8, 'password needs to be atleast 8 characters!')
          next()
        } catch (err) {
          logger.log("User data is invalid!: ", err.message);
          next({ message: err.message, errorCode: 400 });
        }
    },

    login: (req, res, next) => {
      const { Email, Password} = req.body
      pool.getConnection((err, connection) => {
        if (err) {
          logger.log(err)
          next({ message: 'connection failed', errorCode: 500 })
        }
        if (connection) {
          // 1. Kijk of deze useraccount bestaat.
          connection.query(
            'SELECT `ID`, `Email`, `Password`, `First_Name`, `Last_Name` FROM `user` WHERE `Email` = ?',
            Email,
            (err, rows, fields) => {
              connection.release()
              if (err) {
                logger.error('Error: ', err.toString())
                res.status(500).json({
                  message: err.toString(),
                  errorCode: 500
                })
              } else {
                // 2. Er was een resultaat, check het password.
                logger.info('Result from database: ')
                logger.info(rows)
                if (
                  rows &&
                  rows.length === 1 &&
                  rows[0].Password == Password
                ) {
                  logger.info('passwords DID match, sending valid token')
                  // Create an object containing the data we want in the payload.
                  const payload = {
                    id: rows[0].ID
                  }
                  // Userinfo returned to the caller.
                  const userinfo = {
                    id: rows[0].ID,
                    First_Name: rows[0].First_Name,
                    Last_Name: rows[0].Last_Name,
                    Email: rows[0].Email,
                    Token: jwt.sign(payload, jwtSecretKey, { expiresIn: '2h' })
                  }
                  logger.debug('Logged in, sending: ', userinfo)
                  res.status(200).json(userinfo)
                } else {
                  logger.info('User not found or password invalid')
                  next({message: 'user not found or password invalid', errorCode: 400})
                }
              }
            }
          )
        }
      })
    },

    validateToken: (req, res, next) => {
        logger.info('validateToken called')
        // logger.trace(req.headers)
        // The headers should contain the authorization-field with value 'Bearer [token]'
        const authHeader = req.headers.authorization
        if (!authHeader) {
          logger.warn('Authorization header missing!')
          next({message: 'not authorized', errorCode:401})
        } else {
          // Strip the word 'Bearer ' from the headervalue
          const token = authHeader.substring(7, authHeader.length)
    
          jwt.verify(token, jwtSecretKey, (err, payload) => {
            if (err) {
              logger.warn('Not authorized')
              next({message: 'not authorized', errorCode:401})
            }
            if (payload) {
              logger.debug('token is valid', payload)
              // User heeft toegang. Voeg UserId uit payload toe aan
              // request, voor ieder volgend endpoint.
              req.userId = payload.id
              next()
            }
          })
        }
      },

    // renewToken(req, res, next) {
    //     logger.debug('renewToken')
    
    //     pool.getConnection((err, connection) => {
    //       if (err) {
    //         logger.error('Error getting connection from pool')
    //         res
    //           .status(500)
    //           .json({ error: err.toString(), datetime: new Date().toISOString() })
    //       }
    //       if (connection) {
    //         // 1. Kijk of deze useraccount bestaat.
    //         connection.query(
    //           'SELECT * FROM `user` WHERE `ID` = ?',
    //           [req.userId],
    //           (err, rows, fields) => {
    //             connection.release()
    //             if (err) {
    //               logger.error('Error: ', err.toString())
    //               res.status(500).json({
    //                 error: err.toString(),
    //                 datetime: new Date().toISOString()
    //               })
    //             } else {
    //               // 2. User gevonden, return user info met nieuw token.
    //               // Create an object containing the data we want in the payload.
    //               const payload = {
    //                 id: rows[0].ID
    //               }
    //               // Userinfo returned to the caller.
    //               const userinfo = {
    //                 id: rows[0].ID,
    //                 firstName: rows[0].First_Name,
    //                 lastName: rows[0].Last_Name,
    //                 emailAdress: rows[0].Email,
    //                 token: jwt.sign(payload, jwtSecretKey, { expiresIn: '2h' })
    //               }
    //               logger.debug('Sending: ', userinfo)
    //               res.status(200).json(userinfo)
    //             }
    //           }
    //         )
    //       }
    //     })
    // }

}