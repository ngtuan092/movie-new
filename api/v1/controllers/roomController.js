const error_msg = require('../utils')
const db = require('../db')
var callback = (err, result) => {

}

module.exports = {
    getSeatMap: (req, res, next) => {
        // trả lại hàng cột của phòng X, Y 
        // query tất cả toạ độ đã được đặt 
        err = null
        result = { rows: [] }
        maPhong = req.params.maPhong
        console.log(req.query)
        if (!err) {
            var map = []
            for (var i = 0; i < 10; i++)
                map.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
            for (var i = 0; i < 10; i++) {
                for (var j = 0; j < 10; j++) {
                    map[i][j] = (Math.round(Math.random()) % 2 == 0) ? maPhong : 0
                }
            }
            return res.json({ viTri: map })
        }
        else {
            return res.json({
                err_msg: error_msg[err.code] || "undefined error",
                err: err.routine,
                errno: err.code
            })
        }
    }
}