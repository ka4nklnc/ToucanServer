import flowController from './flowController'
import profileController from './profileController'
// import storyController from './storyController'
import suffleController from './suffleController'
import accountController from './accountController'

import express from 'express'
let router = express.Router()

router.use("/flow", flowController)
router.use("/profile", profileController)
    // router.route("/story", storyController)
router.use("/suffle", suffleController)
router.use("/account", accountController)

module.exports = router;