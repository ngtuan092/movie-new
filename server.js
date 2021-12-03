const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const PORT = process.env.PORT || 3000
const server = express()
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

const routes = require('./api/v1/routes')


server.listen(PORT)