import Email from 'email-templates'


let sendmail = function(to, subject, text) {
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

    const email = new Email({
        transport: transporter,
        send: true,
        preview: false,
        views: {
            options: {
                extension: 'ejs',
            },
            root: '../template/',
        },
    });


    email.send({
        template: 'hello',
        message: {
            from: 'Puasnow <noreply@puasnow.com>',
            to: to,
        },

    }).then(() => console.log('email has been send!'));
}