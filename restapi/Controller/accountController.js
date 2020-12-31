import express from 'express'
import userDb from '../../models/database/userModel'
import accountDb from "../../models/database/accountModel"
import mail from '../Helpers/MailHelper'
import random from '../../socket/helpers/randomHelper'
import JDT from '../models/JDTModel'
import Email from 'email-templates'

let router = express.Router();



router.post("/signin", async function(req, res) {
    /**
     * Hesabını email ve parola ile arıyoruz.
     * Eğer Mevcut ise Kullanıcıyı Hesap idsi ile arıyoruz.
     * Eğer Mevcut ise kullanıcı modelini gönderiyoruz.
     * 404 Mevcut Değilse Kullanıcı bulunamadı.
     * 403 Kullanıcı hesabını doğrulamadığı için doğrulama ekranına yönlendirilmeli.
     * 
     * *** Kullanıcı bulunamadıysa hesabını tam olarak oluşturmadığı anlamına gelmekte.
     * *** Hesap oluşturma ekranına yönlendirilmeli. Yada bizimle iletişime geçmeli.
     * 
     * 401 Mevcut Değilse Parola hatalı.
     */
    console.log(req.body)
    console.log("signin email:", req.body.email, "password:", req.body.password)
    let accountModel = await accountDb.findOne({
        email: req.body.email,
        password: req.body.password
    }, function(err, res) {
        console.log(err, res)
    });

    console.log(accountModel)

    if (accountModel != null) {

        if (accountModel.isverification) {
            let userModel = await userDb.findOne({
                userId: accountModel._id
            });
            if (userModel != null)
                res.send(JDT.Model(userModel))
            else
                res.send(JDT.Model(null, false, 404))
        } else {
            res.send(JDT.Model(null, false, 403))
            sendVerificationMail(accountModel)
        }
    } else {
        res.send(JDT.Model(null, false, 401))
    }

})

router.post("/signup", function(req, res) {})

router.get("/reLogin", function(req, res) {})

router.post("/getsms", function(req, res) {})



router.get("/checkmail/:id", async function(req, res) {
    //kullanıcının mail adresi kontrol edilir
    //kullanıcı varsa mail adresine büyülü bir link ile oturum açma bağlantısı gönderilir.
    //kullanıcı eğer yoksa mail adresine kayıt yapabileceği bir bağlantı adresi gönderilir.

    //veri tasarufu için yeni hesap açan kullanıcıların doğrulama kodu parola alanında saklanmaktadır.
    console.log("checkmail", req.params.id)
    let accountModel = await accountDb.findOne({
        $or: [{ username: req.params.id }, { email: req.params.id }]
    });

    if (accountModel != null) {
        if (accountModel.isverification) {
            res.send(JDT.Model(null, true, -1));
            console.log("checkmail", "success")
        } else {
            res.send(JDT.Model(null, false, 403))
                // email.loginMail("http://www.puasnow.com/", "Kaan Kılınç", "ka4nklnc@gmail.com")
            sendVerificationMail(accountModel)
        }
    } else {
        res.send(JDT.Model(null, false, 401));
    }

})


function sendVerificationMail(accountModel) {
    var randomString = random.randomString(150)

    if (!accountModel.isverification) {
        accountModel.password = randomString;
        accountModel.save();
        mail.verificationMail(randomString, accountModel.email)
    }

}

module.exports = router;