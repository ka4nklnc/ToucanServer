import _routerListener from "./listeners/_routerListener";
import authMiddleware from "./middleware/authMiddleware";
import offlineHelper from "./helpers/offlineHelper";
import userModel from "../models/database/userDb";
import { JSONFormat } from "../models/types/JSONFormat";
import { sendUser } from "./helpers/senderHelper";

let WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3081 });
console.log("WebSocket: ws://localhost:3081");
authMiddleware.setWs(wss);
wss.on("connection", function connection(ws) {
    console.log("Device connected.[" + authMiddleware.getCount() + "]", Date());

    ws.pinginterval = setInterval(function() {
        ws.send("ping");
        if (ws.terminatetimer != null) clearTimeout(ws.terminatetimer);
        ws.terminatetimer = setTimeout(function() {
            clearTimeout(ws.terminatetimer);
            clearInterval(ws.pinginterval);
            ws.terminate();
            ws.close(1000, "");
            authMiddleware.logouth(ws);
        }, 15000);
    }, 5000);
    ws.id = authMiddleware.createUId();
    ws.user = null;

    ws.on("message", function incoming(message) {
        onMessage(ws, message);
    });

    ws.on("close", function close(closecode) {
        if (ws != null && ws.user != null && ws.user.userId != null)
            offlineHelper.disconnect(ws.user.userId);
        authMiddleware.logouth(ws);

        if (!ws.user) return;
        try {
            onlinestatus(ws.user.userId, false);
        } catch (e) {
            console.log("App", "close", e);
        }
    });
});

function onlinestatus(userId, state) {
    userModel.findOne({ userId: userId }, (err, resDb) => {
        try {
            resDb.onlinefollowlist.forEach((v, i) => {
                sendUser(
                    v,
                    new JSONFormat(userId, -1, "onlinestatus", state),
                    false,
                    true
                );
            });
        } catch {}
    });
}

function onPing(ws) {
    if (ws.readyState == WebSocket.OPEN) {
        if (ws.user == null) ws.send("ping not login");
        else ws.send("ping");
        console.log("ping");
    }
    clearTimeout(ws.terminatetimer);
}

function receivePong(ws) {
    clearTimeout(ws.terminatetimer);
}

function onMessage(ws, message) {
    if (message == "pong") {
        receivePong(ws);
        return;
    }

    let data = ConvertMessage(message);

    if (data == null) return;
    // if (data.path != "relogin" && data.path != "mUid")
    //     console.log("App", "data:", data.data);
    // if (ws.user)
    //     console.log("App", " incoming message", ws.user.username, data);
    // else console.log("App", "incoming message", "notlogin", data);

    ws.sendCallback = function(res, save = false, resend = true) {
        var model = {
            data: res.data,
            errorCode: res.errorCode,
            state: res.state,
            mUid: data.mUid,
            path: data.path,
        };
        //console.log("App", "Callback //:", data.path);
        if (resend && ws.user != null)
            offlineHelper.push(ws.user.userId, model, save);
        ws.send(JSON.stringify(model));
    };

    _routerListener.manager(ws, data);
}

function ConvertMessage(message) {
    try {
        return JSON.parse(message);
    } catch (e) {
        return console.log("App", "message undefined", e);
    }
}