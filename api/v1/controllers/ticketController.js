const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { error_msg } = require('../utils');

module.exports = {
    ticketsDetailController: async (req, res, next) => {
        var tickets = req.body
        // form ve [{masuatchieu, hang, cot}] return [{suatchieu: {phim, ca: (HH:MM), ngay, gia}}, hang, cot]
        const ticketsDetail = []
        try {
            for (const ticket of tickets) {
                const mave = await db.query('select mave, date_format(han, "%d/%m/%Y %H:%i:%s") han from vephim where malich=? and hang=? and cot=?', [ticket.masuatchieu, ticket.hang, ticket.cot])
                const showtimes = await db.query('select maphim, ca_chieu, date_format(ngayxem, "%d/%m/%Y") as ngayxem from lichphim where malich=?', [ticket.masuatchieu])
                // const han = await db.query('select han from vephim where mave = ?', [mave])
                ticketsDetail.push({
                    suatchieu: {
                        mave: mave[0].mave,
                        phim: showtimes[0].maphim,
                        ca: showtimes[0].ca_chieu,
                        ngay: showtimes[0].ngayxem,
                        han: mave[0].han,
                        gia: 100000
                    },
                    hang: ticket.hang,
                    cot: ticket.cot
                })
            }
            return res.json(ticketsDetail)
        }
        catch (e) {
            return res.send("An error occurs")
        }

    },
    bookController: async (req, res, next) => {
        var tickets = req.body
        // form ve [{masuatchieu, hang, cot}] return [{suatchieu: {phim, ca: (HH:MM), ngay, gia}}, hang, cot]
        const ticketsDetail = []
        try {
            for (const ticket of tickets) {
                const mave = uuidv4()
                await db.query('delete from vephim where convert_tz(han, "+07:00", "+00:00") <= now()')
                const showtimes = await db.query('select maphim, ca_chieu, date_format(ngayxem, "%d/%m/%Y") as ngayxem from lichphim where malich=?', [ticket.masuatchieu])
                const stat = await db.query('insert into vephim(mave, malich, hang, cot, han) values(?,?,?,?,convert_tz(date_add(now(), interval 5 minute), "+00:00", "+07:00"))', [mave, ticket.masuatchieu, ticket.hang, ticket.cot])
                const han = await db.query('select date_format(han, "%d/%m/%Y %H:%i:%s") han from vephim where mave = ?', [mave])
                ticketsDetail.push({
                    suatchieu: {
                        mave,
                        phim: showtimes[0].maphim,
                        ca: showtimes[0].ca_chieu,
                        ngay: showtimes[0].ngayxem,
                        han: han[0].han,
                        gia: 100000
                    },
                    hang: ticket.hang,
                    cot: ticket.cot
                })
            }
            return res.json(ticketsDetail)
        }
        catch (e) {
            console.log(e)
            var error_msg = "An error occurs"
            // console.log(e)
            switch (e.errno){
                case 1062:
                    error_msg = "Vé đã tồn tại"
            }
            return res.json({
                error_msg
            })
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
        catch (e) {
            return res.send(e)
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
