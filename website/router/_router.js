import express from 'express'
let router = express.Router()

import apiController from '../api/Controller'
import websiteController from '../website/Controller'


router.use("/api", apiController)
router.use("/", websiteController)

module.exports = router