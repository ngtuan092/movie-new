const db = require('../db')
const { v4: uuidv4 } = require('uuid');
const shift = ["0", "06:00", "08:00", "10:00", "12:00", "15:00", "17:00", "19:00", "21:00"];

module.exports = {
    getBillUUID: async (req, res, next) => {
        const mahoadon = uuidv4()
        const tickets = req.body
        try {
            await db.query('insert into hoadon(mahoadon, ngaythanhtoan) values(?, convert_tz(now(), "+00:00", "+07:00"))', [mahoadon]);
            const ticketInfolist = []
            for (const ticket of tickets) {
                await db.query('update vephim set han = "9999-12-31" where mave=?', [ticket.mave])
                await db.query('insert into datcho(mahoadon, mave) values(?, ?)', [mahoadon, ticket.mave])
                const [malich] = await db.query('select malich from vephim where mave=?', [ticket.mave])
                const [showtime] = await db.query('select DATE_FORMAT(ngayxem, "%d/%m/%Y") ngay, ca_chieu ca from lichphim where malich = ?', [malich.malich])
                ticketInfolist.push({
                    ngay: showtime.ngay,
                    ca: shift[parseInt(showtime.ca)]
                })
            }
            return res.json({
                result: {
                    mahoadon,
                }


            })
        }
        catch (err) {
            return res.status(404).json({ err })
        }
    },
    getBillDetail: async (req, res, next) => {
        const mahoadon = req.params.mahoadon;
        const cacmave = await db.query('select mave from datcho where mahoadon = ? ', [mahoadon]);
        const ticketlist = []
        try {
            for (const mave of cacmave) {
                // tu mave.mave tìm suất chiếu, hàng, cột
                const [ticket] = await db.query('select han, malich, hang, cot from vephim where mave = ?', [mave.mave])
                const [showtime] = await db.query('select maphim, ca_chieu ca, maphongphim maphong, date_format(ngayxem, "%d/%m/%Y") as ngay from lichphim where malich=?', [ticket.malich])
                const maphim = showtime.maphim
                const phim = await db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where maphim = ?', [maphim])
                const phongphim = await db.query('select sohang, socot from phongphim where maphongphim = ?', [showtime.maphong])
                ticketlist.push({
                    ma: mave.mave,
                    suatchieu: {
                        ma: showtime.ma,
                        phim: phim[0],
                        maphong: showtime.maphong,
                        ngay: showtime.ngay,
                        ca: shift[parseInt(showtime.ca)],
                        hang: phongphim[0].sohang,
                        cot: phongphim[0].socot,
                    },
                    hang: ticket.hang,
                    cot: ticket.cot,
                    han: ticket.han,
                    gia: 100000
                })
            }
            return res.json({
                results: {
                    ma: mahoadon,
                    ve: ticketlist,
                }
            })
        }
        catch (err) {
            console.log(err)
            return res.status(404).json({ err })
        }
    }
}