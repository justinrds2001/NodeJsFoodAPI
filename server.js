const express = require('express')
const app = express()
const port = process.env.PORT || 3000
var router = require('./router')
app.use(express.json()) // for parsing application/json

// Repository
let studenthomes = []

app.use('/router', router)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})