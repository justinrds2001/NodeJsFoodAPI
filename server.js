const express = require('express')
const app = express()
const port = process.env.PORT || 3000
app.use(express.json()) // for parsing application/json

// repository
let studenthomes = []

// Default
app.get('/', (req, res) => {
  let result = {
    'response': 'Hello World!',
    'status': 'Alles OK!'
  }
  res.status(200).json(result)
})

// UC-103 Systeeminfo opvragen
app.get('/api/info', (req, res) => {
  let info = {
    'name': 'Justin Rodrigues da Silva',
    'studentNr': 2144403,
    'description': 'This is a api that returns information about studenthomes and meals',
    'sonarQubeUrl':''
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})