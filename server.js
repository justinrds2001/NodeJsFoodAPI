const express = require('express')
const app = express()
const port = process.env.PORT || 3000
var router = require('./router')
var logger = require('tracer').console()
app.use(express.json()) // for parsing application/json

app.use('/api', router)

app.listen(port, () => {
  logger.log(`Example app listening at http://localhost:${port}`)
})