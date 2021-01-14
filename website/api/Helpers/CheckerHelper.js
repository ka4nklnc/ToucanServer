import accountDb from '../../../models/database/accountDb'

module.exports = {
    emailControl: async function(email, accountId) {
        let accountModel = await accountDb.findOne({ email: email })

        if (accountModel) {
            if (accountModel._id == accountId) {
                console.log("return false")
                return false
            }
            return true
        } else
            return false

    },
    phoneControl: async function(phone, accountId) {
        let accountModel = await accountDb.findOne({ phone: phone })

        if (accountModel) {
            if (accountModel._id == accountId)
                return false

            return true
        } else
            return false
    },
    usernameControl: async function(username, accountId) {
        let accountModel = await accountDb.findOne({ username: username })

        if (accountModel) {
            if (accountModel._id == accountId)
                return false
            return true
        } else
            return false
    }
}