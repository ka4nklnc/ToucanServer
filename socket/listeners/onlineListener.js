const userDb = require("../../models/database/userDb");
const { JSONSuccessFormat } = require("../../models/types/JSONFormat");
let { send, sendUser } = require("../helpers/senderHelper");
let router = require("./_routerListener");

let offlineTimer = [];

router.get("onlineoroffline", true, async(ws, res) => {
    if (!ws.user) return;
    var user = await userDb.findOne({ userId: ws.user.userId });
    user.onlinestatus = {
        isonline: res.data.isonline,
        lastonline: Date(),
    };
    user.save();
    if (res.data.isonline) {
        addofflineTimer(ws);
    } else {
        clearOfflineTimer(ws);
    }
    for (var i = 0; i < user.onlinefollowlist.length; i++) {
        var sendStatus = sendUser(
            user.onlinefollowlist[i].toString(),
            new JSONSuccessFormat({
                    userId: ws.user.userId,
                    isonline: res.data.isonline,
                    lastonline: new Date().toISOString(),
                },
                "onlineoroffline"
            ),
            false,
            false
        );
    }
});

function addofflineTimer(ws) {
    clearOfflineTimer(ws);
    pushOfflineTimer(ws);
}

async function lastseenchange(ws, timer) {
    let user = userDb.findOne({ userId: timer.userId });

    if (user) {
        user.onlinestatus = { isonline: false, lastonline: Date.now() };
    }

    let index = offlineTimer.map((e) => e.userId).indexOf(ws.user.userId);

    offlineTimer.splice(index, 1);
}

async function pushOfflineTimer(ws) {
    let timer = {
        userId: ws.user.userId,
        time: setTimeout(async function() {
            await lastseenchange(ws, timer);
            var user = await userDb.findOne({ userId: ws.user.userId });
            for (var i = 0; i < user.onlinefollowlist.length; i++) {
                sendUser({ userId: user.onlinefollowlist[i] },
                    new JSONSuccessFormat({
                            userId: ws.user.userId,
                            isonline: false,
                            lastonline: new Date().toISOString(),
                        },
                        "onlineoroffline"
                    ),
                    false,
                    false
                );
            }
            user.onlinestatus = {
                isonline: false,
                lastonline: Date(),
            };
            user.save();

            console.log("onlinelistener", "user manuel offline");
        }, 60000),
    };
    offlineTimer.push(timer);
}

async function clearOfflineTimer(ws) {
    let index = offlineTimer.map((e) => e.userId).indexOf(ws.user.userId);
    if (index != -1) {
        clearTimeout(offlineTimer[index].time);
        offlineTimer.splice(index, 1);
    }
}