import userDb from '../../../models/database/userDb'

module.exports = async(req, res, next) => {

    const token = req.headers.authorization;

    let user = await userDb.findOne({
        token: token
    })

    if (user) {
        req.loginuser = user;
        next();
    } else
        res.status(401).send({ message: "Auth failed." })


}