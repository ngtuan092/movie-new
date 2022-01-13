const db = require('../db')

module.exports = {
    getFilms: (req, res, next) => {
        const theloai = req.query.theloai;
        var condition = ""
        if (theloai) {
            condition = ` where json_search(theloai, 'all', "${theloai}") is not null`
        }
        db.query('select count(maphim) from phim' + condition)
            .then((num_film) => {
                const page = parseInt(req.query.page) || 0
                const filmPerPage = req.query.skip || 10
                const maxLength = num_film[0]['count(maphim)']
                if (maxLength < filmPerPage * page)
                    return res.send('Invalid page')
                // bổ sung đánh giá, bia
                db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim' + condition + ' limit ?, ?', [filmPerPage * page, filmPerPage])
                    .then((results) => {
                        return res.json({ results, maxLength })
                    })
                    .catch((err) => {
                        return res.status(404).json({ err })
                    });
            })
            .catch((err) => {
                return res.status(404).json({ err })
            });
    },
    getFilm: (req, res, next) => {
        var maphim = req.params.maphim
        db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where maphim = ?', [maphim])
            .then((rows) => {
                return res.json({ result: rows[0] })
            })
            .catch((err) => {
                return res.status(404).json({ err })
            })
    },
    getFutureFilms: async (req, res, next) => {
        const theloai = req.query.theloai;
        const page = req.query.page || 0;
        const skip = req.query.skip || 10
        var condition = ""
        if (theloai) {
            condition = ` and json_search(theloai, 'all', "${theloai}") is not null`
        }
        try {

            const results = await db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where convert_tz(khoi_chieu, "+07:00", "+00:00") > date(now())' + condition)
            const maxLength = results.length
            return res.json({ results: results.slice(page * skip, (page + 1) * skip), maxLength })
        }
        catch (err) {
            return res.status(404).json({ err })
        }
    }
}
