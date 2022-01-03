// phim-dang-chieu 
const error_msg = require('../utils')
const db = require('../db')
module.exports = {
    getFilms: (req, res, next) => {
        db.query('select count(maphim) from phim').then((num_film) => {
            const page = req.query.page
            const filmPerPage = req.query.num || 10
            const theloai = req.query.theloai;
            var condition = ""
            if (theloai) {
                condition = ` where json_search(theloai, 'all', "${theloai}") is not null`
            }
            if (page) {
                page = parseInt(page)
                if (num_film[0]['count(maphim)'] < filmPerPage * (page - 1))
                    return res.send('Invalid page')
                db.query('select maphim, tenphim, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoi_chieu, ghichu from phim limit ?, ?' + condition, [filmPerPage * (page - 1), filmPerPage])
                    .then((results) => {
                        return res.json({ results })
                    })
                    .catch((err) => {
                        console.log(err)
                        return res.send('An error occurs')
                    });
            }
            else {
                var condition = ""
                if (theloai) {
                    condition = ` where json_search(theloai, 'all', "${theloai}") is not null`
                }
                db.query('select maphim, tenphim, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoi_chieu, ghichu from phim' + condition)
                    .then((results) => {
                        return res.json({ results })
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.send('An error occurs')
                    })
            }
        })
    },
    getFilm: (req, res, next) => {
        var maphim = req.params.maphim
        db.query('select maphim, tenphim, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoi_chieu, ghichu from phim where maphim = ?', [maphim])
            .then((rows) => {
                return res.json({ results: rows[0] })
            })
            .catch((err) => {
                console.log(err)
                return res.send('An error occurs')
            })
    },
    getFutureFilms: async (req, res, next) => {
        const theloai = req.query.theloai;
        var condition = ""
        if (theloai) {
            condition = ` and json_search(theloai, 'all', "${theloai}") is not null`
            
        }
        const results = await db.query('select maphim, tenphim, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoi_chieu, ghichu from phim where convert_tz(khoi_chieu, "+07:00", "+00:00") > date(now())' + condition)
        return res.json({ results })
    }
}