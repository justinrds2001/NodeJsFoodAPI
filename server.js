const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const studenthomeRoutes = require('./src/routes/studenthome-routes')
const logger = require('tracer').console()
app.use(express.json()) // for parsing application/json

// logger
app.all("*", (req, res, next) => {
  logger.log("Endpoint called: " + req.method + " " + req.url)
  next()
})

// Install the routes
app.use('/api/studenthome', studenthomeRoutes)

// UC-103 Systeeminfo opvragen
app.get('/api/info', (req, res) => {
  const info = {
    name: 'Justin Rodrigues da Silva',
    studentNr: 2144403,
    description: 'This is a api that returns information about studenthomes and meals',
    sonarQubeUrl:''
  }
  res.status(200).json(info)
})

// Catch all endpoint
app.all("*", (req, res, next) => {
  logger.log("catch-all endpoint called")
  next({error: 'Endpoint does not exist', errorCode: 401})
})

// Error handler
app.use("*", (error, req, res, next) => {
  logger.log("Errorhandler called!", error)

  res.status(error.errorCode).json({
    message: "Some error occured",
    error: error
  })
})

app.listen(port, () => {
  logger.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app