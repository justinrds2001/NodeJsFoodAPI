const http = require('http')

const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  let result = {
      'response': 'Hello World!',
      'status': 'Alles OK!'
  }
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
})

server.listen(port, () => {
  console.log(`Server running at http://:${port}/`)
})