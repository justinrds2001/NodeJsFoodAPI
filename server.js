const express = require('express')
const app = express()
const port = process.env.PORT || 3000
app.use(express.json()) // for parsing application/json

// Repository
let studenthomes = []

// Logger endpoint
app.all("*", (req, res, next) => {
  console.log("Endpoint called: " + req.method + " " + req.url)
  next()
})

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

// // UC-201 Maak studentenhuis (concept)
// app.post('/api/studenthome', (req, res) => {
//   let studenthome = req.body
//   studenthomes.push(studenthome)
//   res.status(200).json({'status': 'success'})
// })

// // UC-202 Overzicht van studentenhuizen (concept)
// app.get('/api/studenthome?name=:name&city=:city', (req, res) => {
//   res.status(200).json(studenthomes)
// })

// // UC-203, UC-204 en UC-205 (concept)
// app.route('/api/studenthome/:homeId')
//   .get((req, res) => {
    
//   })
//   .put((req, res) => {
    
//   })
//   .delete((req, res) => {
    
//   })

// // UC-206 Gebruiker toevoegen aan studentenhuis (concept)
// app.put('/api/studenthome/:homeId/user', (req, res) => {
  
// })

// Catch all endpoint
app.all("*", (req, res, next) => {
  console.log("catch-all endpoint called")
  next({error: 'Endpoint does not exist', errorCode: 401})
})

// Error handler
app.use("*", (error, req, res, next) => {
  console.log("Errorhandler called!")
  console.log(error)

  res.status(error.errorCode).json({
    message: "Some error occured",
    error: error
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})