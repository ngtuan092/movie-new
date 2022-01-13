const error_msg = require('../utils')
const db = require('../db')

module.exports = {
    getShowtimes: (req, res, next) => {
        var maphim = req.query.maphim;
        var ngay = req.query.ngay;
        const page = req.query.page || 0
        var arg = ""
        const num = req.query.num || 10
        if (page)
        {
            arg = `limit ${num * (page - 1)}, ${num}`
        }
        if (maphim) {
            maphim = Number(maphim)
            db.query('select malich, maphim, maphongphim maphong, DATE_FORMAT(ngayxem, "%d/%m/%Y") as ngayxem, ca_chieu ca from lichphim where ngayxem = str_to_date(?, "%d/%m/%Y") and maphim = ?' + arg, [ngay, maphim])
                .then((results) => {
                    return res.json({ results })
                })
                .catch((err) => {
                    console.log(err)
                    return res.status(404).send("An error occurs")
                })

        }
        else {
            db.query(`select malich, maphim, maphongphim, DATE_FORMAT(ngayxem, "%d/%m/%Y") as ngayxem, ca_chieu ca from lichphim where ngayxem = str_to_date(?, "%d/%m/%Y")` + arg
                , [ngay])
                .then((results) => {
                    return res.json({ results })
                })
                .catch((err) => {
                    console.log(err)
                    return res.send("An error occurs")
                })
        }

    },
    getShowtime: async (req, res, next) => {
        const masuatchieu = req.params.masuatchieu;
        const maphong = await db.query('select maphongphim from lichphim where malich=?', [Number(masuatchieu)])
        const phongphim = await db.query('select sohang, socot from phongphim where maphongphim=?', [maphong[0].maphongphim])
        await db.query('delete from vephim where convert_tz(han, "+07:00", "+00:00") <= now()')
        const tickets = await db.query('select hang, cot, han from vephim where malich = ? and convert_tz(han, "+07:00", "+00:00") > now()', [masuatchieu])
        const sohang = phongphim[0].sohang;
        const socot = phongphim[0].socot;
        const map = []
        for (let i = 0; i < sohang; i++) {  
            const arr = []
            for (let j = 0; j < socot; j++)
                arr.push(false)
            map.push(arr)
        }
        for (const ticket of tickets) {
            var i = ticket.hang;
            var j = ticket.cot;
            console.log(ticket.han)
            map[i][j] = true
        }
        return res.json({ results: map })
    }
}

