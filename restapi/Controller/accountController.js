import express from 'express'
import userDb from '../../models/database/userModel'

let router = express.Router();



router.get("/signin", function(req, res) {})

router.post("/signup", function(req, res) {})

router.get("/reLogin", function(req, res) {})

router.post("/getsms", function(req, res) {})

router.post("/checkmail", async function(req, res) {
    //kullanıcının mail adresi kontrol edilir
    //kullanıcı varsa mail adresine büyülü bir link ile oturum açma bağlantısı gönderilir.
    //kullanıcı eğer yoksa mail adresine kayıt yapabileceği bir bağlantı adresi gönderilir.

    let userModel = await userDb.findOne({
        $or: [{ username: req.params.n }, { email: req.params.n }]
    });

    if (userModel != null) {

    } else {

    }

})


module.exports = router;