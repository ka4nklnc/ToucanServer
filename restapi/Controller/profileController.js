import express from 'express'
import _authMiddleware from '../middleware/_auth'
import JDT from '../models/JDTModel'
let router = express.Router();

router.get("/:username", _authMiddleware, function(req, res) {

    res.send(JDT.Model(req.loginuser))
})


module.exports = router;