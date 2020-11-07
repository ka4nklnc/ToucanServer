"use strict";
let router = require("./_routerListener");
let offlineHelper = require("../helpers/offlineHelper");
router.get("mUid", false, (ws, res) => {
  console.log("DeliveryListener","mUid",res.data.mUid)
  offlineHelper.remove(res.data.mUid,ws);
});
