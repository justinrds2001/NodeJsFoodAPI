const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const studenthomeRoutes = require('./src/routes/studenthome-routes')
const mealRoutes = require('./src/routes/meal-routes')
const authenticationRoutes = require('./src/routes/authentication-routes')


const logger = require('tracer').console()
app.use(express.json()) // for parsing application/json

// Add CORS headers
app.use( (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type,authorization'
  )
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

// logger
app.all("*", (req, res, next) => {
  logger.log("Endpoint called: " + req.method + " " + req.url)
  next()
})

// Install the routes
app.use('/api/studenthome', studenthomeRoutes)
app.use('/api/studenthome', mealRoutes)
app.use('/api', authenticationRoutes)

// UC-103 Systeeminfo opvragen
app.get('/api/info', (req, res) => {
  const info = {
    name: 'Justin Rodrigues da Silva',
    studentNr: 2144403,
    description: 'This is a api that returns information about studenthomes and meals',
    sonarQubeUrl:'https://sonarqube.avans-informatica-breda.nl/dashboard?id=programmeren-4-samen-eten'
  }
  res.status(200).json(info)
})

// Catch all endpoint
app.all("*", (req, res, next) => {
  logger.log("catch-all endpoint called")
  next({message: 'Endpoint does not exist', errorCode: 401})
})

// Error handler
app.use("*", (error, req, res, next) => {
  logger.log("Errorhandler called!", error)

  res.status(error.errorCode).json({
    error: "Some error occured",
    message: error.message
  })
})

app.listen(port, () => {
  logger.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app