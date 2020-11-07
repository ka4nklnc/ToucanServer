"use strict";

var gcm = require("node-gcm");
/**
 *
 * @param {string} token
 */
exports.sendNoti = (token, title, body, message, data) => {
  var sender = new gcm.Sender(
    "AAAAC-esIzo:APA91bGdiVq92oF8Xs65hcCTplpFEyfbrxxPu_c2PArSXHRHs9jUprCKfRLyX0T1sRpgB0cBJVjfCrrR_bXupVdaUsD9rZ-KTjp2wN0-ACuXTY5oRd9QOQmviBJdBLpPEXEycXjOfeiy"
  );

  var msg = new gcm.Message({
    data: { ...data, title, body, message },
    // data:{
    //   bodymessage:"",
    //   bodyreceiveuid:"",
    //   bodysenderuid:"",
    //   bodytime:0,
    //   bodymessagestatus:-1,
    //   body_id=""
    // }
  });

  var regTokens = [token];

  sender.send(msg, { registrationTokens: regTokens }, (err, res) => {
    if (err) console.log("pushnotificationHelper", "sendNoti", err);
    else console.log("pushNoti", "sendNoti", res);
  });
};
