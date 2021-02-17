"use strict";
let random = require("../helpers/randomHelper");
let offlineHelper = require("../helpers/offlineHelper");
let userDb = require("../../models/database/userDb");
const WebSocket = require("ws");
const { JSONSuccessFormat } = require("../../models/types/JSONFormat");

let wss;

exports.isLogin = (ws) => {
    var user = null;
    wss.clients.forEach((v) => {
        if (v != null && v.id == ws.id) return (user = v);
    });

    return user;
};

exports.logouth = (ws) => {
    //User find and logouth
    console.log("Device disconnect.", Date());
    clearTimeout(ws.terminatetimer);

    wss.clients.forEach((v) => {
        if (v.id == ws.id) v.terminate();
    });
};

exports.login = (user, ws) => {
    ws.user = user;
    offlineHelper.getDb(user.userId);
};

exports.relogin = async(ws, req) => {
    let token = req.headers["authorization"];

    if (!token) return;

    var user = await userDb.findOne({ token: token });
    if (user) {
        ws.user = user;
        offlineHelper.getDb(user.userId);
    }
};
/**
 *
 * @param {*} userId
 *
 * return websocket
 */
exports.getLoginUser = (userId) => {
    var user = null;
    wss.clients.forEach((v) => {
        if (v != null && v.user != null && v.user.userId == userId) {
            user = v;
        }
    });
    return user;
};

exports.createUId = () => {
    let uid = "";
    let state = false;

    do {
        uid = random.randomString(150);

        wss.clients.forEach((v) => {
            if (v.id == uid) return (state = true);
        });
    } while (state);

    return uid;
};

exports.getCount = () => {
    return wss.clients.size;
};

/**
 *
 * @param {WebSocket.Server} wss
 */
exports.setWs = (asd) => {
    setWs(asd);
};

function setWs(ws) {
    wss = ws;
}