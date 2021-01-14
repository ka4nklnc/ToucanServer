import homeController from "./homeController";
import loginController from "./loginController";
import express from "express";
let router = express.Router();

router.use("/", homeController);
router.use("/", loginController);

module.exports = router;