// phim-dang-chieu 
const error_msg = require('../utils')
const db = require('../db')
module.exports = {
    getFilms: (req, res, next) => {
        db.query('select count(maphim) from phim').then((num_film) => {
            const page = parseInt(req.query.page) || 0
            const theloai = req.query.theloai;
            const filmPerPage = req.query.skip || 10
            var condition = ""
            if (theloai) {
                condition = ` where json_search(theloai, 'all', "${theloai}") is not null`
            }
            const maxLength = num_film[0]['count(maphim)']
            if (maxLength < filmPerPage * (page - 1))
                return res.send('Invalid page')
            // bổ sung đánh giá, bia
            db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim limit ?, ?' + condition, [filmPerPage * page, filmPerPage * (page + 1)])
                .then((results) => {
                    return res.json({ results, maxLength })
                })
                .catch((err) => {
                    return res.json({ err })
                });
        })
    },
    getFilm: (req, res, next) => {
        var maphim = req.params.maphim
        db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where maphim = ?', [maphim])
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
        try {

            const results = await db.query('select danhgia, bia, maphim ma, tenphim ten, thoigian, theloai, ngonngu, rate, trailer, date_format(khoi_chieu, "%d/%m/%Y") khoichieu, ghichu noidung from phim where convert_tz(khoi_chieu, "+07:00", "+00:00") > date(now())' + condition)
            const maxLength = results.length
            return res.json({ results, maxLength })
        }
        catch (e) {
            return res.json({err: e})
        }
    }
}

// mock.onGet('/api/phim-sap-chieu').reply((config) => {
//     try {
//         const { page, theloai } = config.params || { page: 0 };
//         const maxLength = movies.length;

//         const results = movies.slice(page * skip, (page + 1) * skip);

//         return [200, { results, maxLength }];
//     } catch (error) {
//         console.log(error);
//     }
// });


// mock.onGet("/api/phim/:maphim").reply((config) => {
//     try {
//         let { maphim } = config.routeParams;
//         maphim = Number(maphim);
//         return [200, { result: movies[maphim] }]
//     } catch (error) {
//         console.log(error);
//     }
// })