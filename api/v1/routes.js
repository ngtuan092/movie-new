const express = require("express")

const filmController = require('./controllers/filmController')
const filmRouter = express.Router()
filmRouter.use('/:maphim', filmController.getFilm)
filmRouter.use('/', filmController.getFilms)

const showtimeController = require('./controllers/showtimeController')
const showtimeRouter = express.Router()
showtimeRouter.use('/:masuatchieu/ghe', showtimeController.getShowtime)
showtimeRouter.use('/', showtimeController.getShowtimes)


const ticketController = require('./controllers/ticketController')
const ticketRouter = express.Router()
ticketRouter.use('/chi-tiet', ticketController.ticketsDetailController)
ticketRouter.use('/huy', ticketController.removeTickets)
ticketRouter.use('/dat', ticketController.bookController)

const billController = require('./controllers/billController')
const billRouter = express.Router()
billRouter.use('/:mahoadon',billController.getBillDetail)
billRouter.use(billController.getBillUUID)

module.exports = function(server) {
    server.use('/api/phim-sap-chieu', filmController.getFutureFilms)
    server.use('/api/phim', filmRouter)
    server.use('/api/suat-chieu', showtimeRouter)
    server.use('/api/ve', ticketRouter)
    server.use('/api/hoa-don', billRouter)
}