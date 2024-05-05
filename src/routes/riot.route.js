const express = require("express");
const router = express.Router();
const controller = require("../controllers/riot.controller")


//router.get(<path>,<controller>.<method>)
router.get("/champions/:champion/bio", controller.getChampionBio);
router.get("/champions/:champion", controller.getChampion);
router.get("/champions", controller.getAllChampions);

module.exports = router;


