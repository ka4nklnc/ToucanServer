import express from "express";
let router = express.Router();

let accountDb = require("../../../models/database/accountDb");

router.get("/login/:verificationcode", async function(req, res) {
    console.log("/login?verificationcode", req.params);
    let accountModel = await accountDb.findOne({
        isverification: false,
        verificationcode: req.params.verificationcode,
    });

    if (accountModel) {
        accountModel.verificationcode = "";
        accountModel.isverification = true;
        await accountModel.save();
        res.send(
            "Doğrulama başarılı. Şimdi telefonunuzdan uygulamamızı açarak 'Kontrol Et' düğmesine tıklayınız."
        );
    } else res.send("Hesabınızı bulamadık. Eğer doğrulama aşamasını geçemiyorsanız en son gelen doğrulama mesajını kontrol ediniz.");
});

module.exports = router;