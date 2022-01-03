const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 3000
const server = express()
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(cors())
const routes = require('./api/v1/routes')
routes(server)
server.use(function(req, res) {
    return res.status(404).send({url: req.originalUrl + ' not found'})
})

server.listen(PORT)
console.log(`Server listen on port: ${PORT}`)