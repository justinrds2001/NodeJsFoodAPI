const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  let result = {
    'response': 'Hello World!',
    'status': 'Alles OK!'
  }
  res.json(result)
})

// UC-103 Systeeminfo opvragen
app.get('/api/info', (req, res) => {
  let info = {
    'name': 'Justin Rodrigues da Silva',
    'studentNr': 2144403,
    'description': 'This is a api that returns information about food',
    'sonarqube-url':''
  }
  res.json(info)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})