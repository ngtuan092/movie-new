const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const shift = ["0", "06:00", "08:00", "10:00", "12:00", "15:00", "17:00", "19:00", "21:00"];
module.exports = {
    ticketsDetailController: async (req, res, next) => {
        var tickets = req.body
        const ticketsDetail = []
        try {
            for (const ticket of tickets) {
                const mave = await db.query('select mave, date_format(han, "%d/%m/%Y %H:%i:%s") han from vephim where malich=? and hang=? and cot=? and convert_tz(han, "+07:00", "+00:00") > now()', [ticket.masuatchieu, ticket.hang, ticket.cot])
                const showtime = await db.query('select maphim, ca_chieu ca, maphongphim maphong, date_format(ngayxem, "%d/%m/%Y") as ngay from lichphim where malich=?', [ticket.masuatchieu])
                const maphim = showtime[0].maphim
                const phim = await db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where maphim = ?', [maphim])
                const phongphim = await db.query('select sohang, socot from phongphim where maphongphim = ?', [showtime[0].maphong])
                ticketsDetail.push({
                    suatchieu: {
                        ma: showtime[0].ma,
                        phim: phim[0],
                        maphong: showtime[0].maphong,
                        ngay: showtime[0].ngay,
                        ca: shift[parseInt(showtime[0].ca)],
                        hang: phongphim[0].sohang,
                        cot: phongphim[0].socot,
                    },
                    trong: mave.length == 0,
                    hang: ticket.hang,
                    cot: ticket.cot,
                    gia: 100000
                })
            }
            return res.json({ results: ticketsDetail })
        }
        catch (err) {
            console.log(err)
            return res.status(404).json({ err })
        }

    },
    bookController: async (req, res, next) => {
        var tickets = req.body
        const ticketsDetail = []
        try {
            for (const ticket of tickets) {
                const mave = uuidv4()
                await db.query('delete from vephim where convert_tz(han, "+07:00", "+00:00") <= now()')
                const showtime = await db.query('select maphim, ca_chieu ca, maphongphim maphong, date_format(ngayxem, "%d/%m/%Y") as ngay from lichphim where malich=?', [ticket.masuatchieu])
                await db.query('insert into vephim(mave, malich, hang, cot, han) values(?,?,?,?,convert_tz(date_add(now(), interval 5 minute), "+00:00", "+07:00"))', [mave, ticket.masuatchieu, ticket.hang, ticket.cot])
                const han = await db.query('select date_format(han, "%d/%m/%Y %H:%i:%s") han from vephim where mave = ?', [mave])
                const maphim = showtime[0].maphim
                const phim = await db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where maphim = ?', [maphim])
                const phongphim = await db.query('select sohang, socot from phongphim where maphongphim = ?', [showtime[0].maphong])
                ticketsDetail.push({
                    mave,
                    suatchieu: {
                        ma: showtime[0].ma,
                        phim: phim[0],
                        maphong: showtime[0].maphong,
                        ngay: showtime[0].ngay,
                        ca: shift[parseInt(showtime[0].ca)],
                        hang: phongphim[0].sohang,
                        cot: phongphim[0].socot,
                    },
                    han: han[0].han,
                    hang: ticket.hang,
                    cot: ticket.cot,
                    gia: 100000
                })
            }
            return res.json({ results: ticketsDetail })
        }
        catch (err) {
            return res.status(404).json({ err })
        }
    },
    removeTickets: async (req, res, next) => {
        var tickets = req.body
        const status = "success"
        try {
            for (const ticket of tickets) {
                await db.query('delete from vephim where malich=? and hang=? and cot=?', [ticket.masuatchieu, ticket.hang, ticket.cot])
            }
            await db.query('delete from vephim where convert_tz(han, "+07:00", "+00:00") <= now()')
            return res.json({ status })
        }
        catch (err) {
            return res.status(404).json(err)
        }
    }
}




// mock.onPost("/api/ve/chi-tiet").reply((config) => {
//     // lấy thông tin chi tiết của vé
//     try {
//         const tickets = JSON.parse(config.data);
//         const detailedTickets = [];
//         Object.keys(tickets).forEach(showtimeId => {
//             const suatchieu = showtimes[showtimeId];
//             tickets[showtimeId].forEach(v => {
//                 detailedTickets.push({ phim: suatchieu.phim, suatchieu: { ...suatchieu, gio: shift[suatchieu.ca] }, hang: v.r, cot: v.c, gia: faker.datatype.number({ min: 10, max: 15 }) * 1e4, trong: faker.datatype.number({ max: 5 }) > 1 })
//             });
//         })
//         return [200, { results: detailedTickets }];
//     } catch (error) {
//         console.log(error);
//     }
// })

// mock.onPost("/api/ve/dat").reply((config) => {
//     // tạm thời tạo vé, nếu không thanh toán xong thì xoá, nhớ thêm trường expired để nhỡ khách hàng không thanh toán
//     try {
//         const tickets = JSON.parse(config.data);
//         const detailedTickets = [];
//         Object.keys(tickets).forEach(showtimeId => {
//             const suatchieu = showtimes[showtimeId];
//             tickets[showtimeId].forEach(v => {
//                 if (faker.datatype.number({ max: 5 }) > 1) detailedTickets.push({ suatchieu: { ...suatchieu, gio: shift[suatchieu.ca] }, hang: v.r, cot: v.c, gia: faker.datatype.number({ min: 10, max: 15 }) * 1e4 })
//             });
//         })
//         return [200, { results: detailedTickets }];
//     } catch (error) {
//         console.log(error);
//     }
// })

// mock.onPost("/api/ve/huy").reply((config) => {
//     // xoá vé
//     const status = "success"
//     return [200, { status }];

// })
