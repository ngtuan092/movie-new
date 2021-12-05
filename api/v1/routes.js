const express = require("express")

const filmController = require('./controllers/filmController')
const filmRouter = express.Router()


const trailerController = require('./controllers/trailerController')
const trailerRouter = express.Router()


const roomController = require('./controllers/roomController')
const roomRouter = express.Router()
roomRouter.use('/vi-tri/:maPhong', roomController.getSeatMap)

module.exports = module.exports = function(server) {
    server.use('/api/v1', roomRouter);
}