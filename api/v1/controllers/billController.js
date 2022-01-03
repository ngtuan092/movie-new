const db = require('../db')
const { v4: uuidv4 } = require('uuid');
module.exports = {
    getBillUUID: async (req, res, next) => {
        const mahoadon = uuidv4()
        const tickets = req.body
        try {
            await db.query('insert into hoadon(mahoadon, ngaythanhtoan) values(?, convert_tz(now(), "+00:00", "+07:00"))', [mahoadon]);
            for (const ticket of tickets) {
                const mave = await db.query('select mave from vephim where malich=? and hang=? and cot=? and convert_tz(han, "+07:00", "+00:00") > now()', [ticket.masuatchieu, ticket.hang, ticket.cot])
                if (!mave[0])
                {
                    // console.log("error")
                    const e = new Error("Tickets does not exists or has been expired.");
                    throw e;
                }
                await db.query('update vephim set han = "9999-12-31" where mave=?', [mave[0].mave])
                await db.query('insert into datcho(mahoadon, mave) values(?, ?)', [mahoadon, mave[0].mave])
            }

            return res.json({ mahoadon })
        }
        catch (e) {
            return res.json({
                msg: e.message,
            }
            )
        }
    },
    getBillDetail: async (req, res, next) => {
        const mahoadon = req.params.mahoadon;
        const cacmave = await db.query('select mave from datcho where mahoadon = ? ', [mahoadon]);
        const mavelist = []
        for (const mave of cacmave) {
            mavelist.push(mave.mave)
        }
        return res.json({ result: mavelist })
    }
}