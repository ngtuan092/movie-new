const db = require('../db');
const shift = ["0", "06:00", "08:00", "10:00",  "12:00", "15:00", "17:00", "19:00", "21:00"];
module.exports = {
    getShowtimes: async (req, res, next) => {
        const maphim = req.query.maphim;
        const ngay = req.query.ngay;
        const page = req.query.page || 0
        const skip = req.query.skip || 10
        if (maphim) {
            try {
                const showtimes = await db.query('select malich ma, maphim, maphongphim maphong, DATE_FORMAT(ngayxem, "%d/%m/%Y") ngay, ca_chieu ca from lichphim where ngayxem = str_to_date(?, "%d/%m/%Y") and maphim = ? limit ?, ?', [ngay, maphim, skip * page, skip])
                const list = []
                for (const showtime of showtimes) {
                    const maphim = showtime.maphim;
                    const phim = await db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where maphim = ?', [maphim])
                    const phongphim = await db.query('select sohang, socot from phongphim where maphongphim = ?', [showtime.maphong])

                    list.push(
                        {
                            ma: showtime.ma,
                            phim: phim[0],
                            maphong: showtime.maphong,
                            ngay: showtime.ngay,
                            ca: shift[parseInt(showtime.ca)],
                            hang: phongphim[0].sohang,
                            cot: phongphim[0].socot,
                        }
                    )
                }
                return res.json({ results: list })
            }
            catch (err) {
                return res.json({ err })
            }
        }
        else {
            try {
                const showtimes = await db.query('select malich ma, maphim, maphongphim maphong, DATE_FORMAT(ngayxem, "%d/%m/%Y") ngay, ca_chieu ca from lichphim where ngayxem = str_to_date(?, "%d/%m/%Y") limit ?,?', [ngay, skip * page, skip])
                const list = []
                for (const showtime of showtimes) {
                    const maphim = showtime.maphim;
                    const phim = await db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where maphim = ?', [maphim])
                    const phongphim = await db.query('select sohang, socot from phongphim where maphongphim = ?', [showtime.maphong])
                    list.push(
                        {
                            ma: showtime.ma,
                            phim: phim[0],
                            maphong: showtime.maphong,
                            ngay: showtime.ngay,
                            ca: shift[parseInt(showtime.ca)],
                            hang: phongphim[0].sohang,
                            cot: phongphim[0].socot,
                        }
                    )
                }
                return res.json({ results: list })
            }
            catch (err) {
                return res.json({ err })
            }
        }
    },
    getShowtime: async (req, res, next) => {
        const masuatchieu = req.params.masuatchieu;
        try {
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
                map[i][j] = true
            }
            return res.json({ results: map })
        }
        catch (err) {
            return res.json({ err })
        }
    }

}