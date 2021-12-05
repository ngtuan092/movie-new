// phim-dang-chieu 
const error_msg = require('../utils')
const db = require('../db')
var callback = (err, result) => {
    if (!err)
        return res.json(result.rows)
    else {
        return res.json({
            err_msg: error_msg[err.code] || "undefined error",
            err: err.routine,
            errno: err.code
        })
    }
}
module.exports = {
    getPhimDangChieu: (req, res, next) => {
        // query Phim từ ca sau đến cuối đời
        ```
        select * from phim where maphim in 
        (
            select maphim from lichphim 
            where Date(ngaychieu) = select Date(now()) and ca(phim) = ca(NOW) 
        )
        ```
        
    }, 
    getPhimSapChieu: (req, res, next) => {
        // từ ca sau đến ngày tàn trái đất
        ```
        select * from phim where maphim in 
        (
            select maphim from lichphim 
            where Date(ngaychieu) >= select Date(now()) and ca(phim) > ca(NOW) 
        )
        ```
    }
}






// trả lại list phim theo order 10 phim mỗi page
