import path from 'path'
import ejs from 'ejs'
import Email from 'email-templates'
import nodemailer from 'nodemailer'

module.exports.loginMail = function(link, namesurname, email) {

    //Html olarak mail göndermeyi sağlar
    // name ve link olarak iki parametre almakta.
    //Sorunsuz çalışması durumunda mail gönderilir.
    ejs
        .renderFile(path.join(__dirname, "../template/EmailLogin.ejs"), {
            namesurname: namesurname,
            link: 'http://www.puasnow.com/login?lc=' + link
        })
        .then(emailtemplate => {
            //mail gönderme kısmı
            sendmail(email, "Puasnow oturum açma", "", emailtemplate)
        })
        .catch(err => {
            console.log(
                "Error Rendering emailTemplate",
                err
            );
        });
}


module.exports.verificationMail = function(verificationCode, email) {
    ejs
        .renderFile(path.join(__dirname, "../template/EmailVerificaiton.ejs"), {
            link: 'http://www.puasnow.com/login/' + verificationCode
        })
        .then(emailtemplate => {
            //mail gönderme kısmı
            sendmail(email, "Puasnow Hesap Doğrulama", "", emailtemplate)
        })
        .catch(err => {
            console.log(
                "Error Rendering emailTemplate",
                err
            );
        });
}

module.exports.passwordLost = function(newPassword, email) {
    ejs
        .renderFile(path.join(__dirname, "../template/ForgotPassword.ejs"), {
            newpassword: newPassword
        })
        .then(emailtemplate => {
            //mail gönderme kısmı
            sendmail(email, "Puasnow Hesap Doğrulama", "", emailtemplate)
        })
        .catch(err => {
            console.log(
                "Error Rendering emailTemplate",
                err
            );
        });
}


let sendmail = function(to, subject, text, html) {
    //E-posta ayarları
    //Şu an için yandex mail üzerinden işlem gerçekleştirilmekte.
    const transporter = nodemailer.createTransport({
            direct: true,
            host: 'smtp.yandex.com',
            port: 465,
            auth: {
                user: 'noreply@puasnow.com',
                pass: 'deliolan42'
            },
            secure: true
        })
        //Mail içeriği ve alıcı ayarları
    var mailOptions = {
        from: 'noreply@puasnow.com',
        to: to,
        subject: subject,
        text: text,
        html: html
    };
    //maili gönderme alanı
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}