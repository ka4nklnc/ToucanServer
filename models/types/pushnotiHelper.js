"use strict";

var gcm = require("node-gcm");
/**
 *
 * @param {string} token
 * @param {JSONFormat} data
 */
exports.sendNoti = (token, data) => {
    var sender = new gcm.Sender(
        "AAAAC-esIzo:APA91bGdiVq92oF8Xs65hcCTplpFEyfbrxxPu_c2PArSXHRHs9jUprCKfRLyX0T1sRpgB0cBJVjfCrrR_bXupVdaUsD9rZ-KTjp2wN0-ACuXTY5oRd9QOQmviBJdBLpPEXEycXjOfeiy"
    );

    var msg = new gcm.Message({
        data: {...data },
    });

    var regTokens = [token];

    sender.send(msg, { registrationTokens: regTokens }, (err, res) => {
        if (err) console.log("pushnotificationHelper", "sender Error: ", err);
        else console.log("pushNoti", "sender Success: ", res, regTokens);
    });
};

/**
 *
 * @param {String} path
 * @param {Object} data
 */
module.exports.Model = function(path, data) {
    this.path = path;
    this.data = data;
    console.log("JSONSuccessFormat", data);
    return this;
};