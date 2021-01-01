import express from 'express'
import userDb from '../../models/database/userDb'
import accountDb from "../../models/database/accountDb"
import mail from '../Helpers/MailHelper'
import random from '../../socket/helpers/randomHelper'
import JDT from '../models/JDTModel'

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

router.post("/signup", async function(req, res) {
    console.log("signup", req.body)

    let accountEmailModel = await accountDb.findOne({ email: req.body.email });

    let accountPhoneModel = await accountDb.findOne({ phone: req.body.phone })
    if (accountEmailModel) {
        return res.send(JDT.Model(null, false, 402))
    }

    if (accountPhoneModel) {
        return res.send(JDT.Model(null, false, 403))
    }

    if (req.body.password.length < 6) {
        return res.send(JDT.Model(null, false, 401))
    }

    //Kullanıcı hesabı oluşturma adımları.
    //accountDb
    let newAccountModel = new accountDb({
        username: "test",
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
    });

    await newAccountModel.save()
    newAccountModel.username = newAccountModel._id;
    await newAccountModel.save()

    let newUserModel = new userDb({
        userId: newAccountModel._id,
        username: newAccountModel._id,
        email: req.body.email,
        phone: req.body.phone,
        profileurl: "default",
        namesurname: req.body.namesurname,
        bio: "",
        follower: 0,
        following: 0,
        shared: 0,
        vipStatus: false,
        vipFinishTime: Date.now(),
        cloudMessagingToken: "x",
        token: newAccountModel._id
    })

    await newUserModel.save()

    res.send(JDT.Model(newUserModel))
})

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

router.get("/resetpassword/:id", async function(req, res) {

    console.log("resetpassword", req.params);

    let accountModel = await accountDb.findOne({
        email: req.params.id
    })

    if (accountModel) {
        accountModel.password = random.randomString(6)
        accountModel.save()
        sendNewPassword(accountModel)
    }

    res.send(JDT.Model())
})

function sendNewPassword(accountModel) {
    mail.passwordLost(accountModel.password, accountModel.email)
}

function sendVerificationMail(accountModel) {
    var randomString = random.randomString(150)

    if (!accountModel.isverification) {
        accountModel.password = randomString;
        accountModel.save();
        mail.verificationMail(randomString, accountModel.email)
    }

}

module.exports = router;