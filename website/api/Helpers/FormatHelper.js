import emailvalidator from 'email-validator'

module.exports = {
    mailFormat: function(email) {
        return !emailvalidator.validate(email)
    },
    usernameFormat: function(username) {
        return username.length > 3 ? false : true
    },
    phoneFormat: function(phone) {
        return !(phone.length == 10)
    },
    passwordFormat: function(password) {
        return password.length > 6 ? false : true
    }
}