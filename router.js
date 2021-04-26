var express = require('express')
var logger = require('tracer').console();
var database = require('./database')
var router = express.Router()

// Logger endpoint
router.all("*", (req, res, next) => {
    logger.log("Endpoint called: " + req.method + " " + req.url)
    next()
})
  
// UC-103 Systeeminfo opvragen
router.get('/info', (req, res) => {
    const info = {
      name: 'Justin Rodrigues da Silva',
      studentNr: 2144403,
      description: 'This is a api that returns information about studenthomes and meals',
      sonarQubeUrl:''
    }
    res.status(200).json(info)
})
  
// UC-201 en UC-202
router.route('/studenthome').
    post((req, res) => {
        let info = req.body
        let studenthome = {
            id: database.db.length + 1,
            info: req.body
        }
        database.add(studenthome)
        res.status(200).json({status: 'success',
        request: studenthome})
    })
    .get((req, res) => {
        // query params ?name=:name&city=:city
        res.status(200).json(database.db)
    })
  
// UC-203, UC-204 en UC-205 (concept)
router.route('/studenthome/:homeId')
    .get((req, res, next) => {
        const id = req.params.homeId
        let isFound = false
        database.db.forEach((studentHome, index) => {
            if(id == studentHome.id) {
                logger.log('item was found')
                isFound = true
                res.status(400).json(studentHome).end()
            }
        })
        if(!isFound) {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
        }
    })
    .put((req, res) => {
      const id = req.params.homeId
      let isFound = false
      database.db.forEach((studentHome, index) => {
            if(id == studentHome.id) {
                logger.log('item was found')
                isFound = true
                let studenthome = {
                    id: parseInt(id),
                    info: req.body
                }
                database.db.splice(index, 1, studenthome)
                logger.log('item was found')
                res.status(400).json(studentHome).end()
            }
        })
        if(!isFound) {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
        }
    })
    .delete((req, res) => {
        const id = req.params.homeId
        let isFound = false
        database.db.forEach((studentHome, index) => {
              if(id == studentHome.id) {
                  logger.log('item was found')
                  isFound = true
                  database.db.splice(index, 1)
                  logger.log('item was found')
                  const response = {
                      status: 'success',
                      message: 'item with id: ' + id + ' was deleted!' 
                  }
                  res.status(400).json(response).end()
              }
          })
          if(!isFound) {
              logger.log('item was not found')
              next({error: 'item not found', errorCode: 404})
          }
    })
  
// // UC-206 Gebruiker toevoegen aan studentenhuis (concept)
// router.put('/studenthome/:homeId/user', (req, res) => {
    
// })
  
// Catch all endpoint
router.all("*", (req, res, next) => {
    logger.log("catch-all endpoint called")
    next({error: 'Endpoint does not exist', errorCode: 401})
})
  
// Error handler
router.use("*", (error, req, res, next) => {
    logger.log("Errorhandler called!", error)
  
    res.status(error.errorCode).json({
      message: "Some error occured",
      error: error
    })
})

module.exports = router