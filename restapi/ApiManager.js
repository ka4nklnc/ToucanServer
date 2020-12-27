import flowController from './Controller/flowController'
import profileController from './Controller/profileController'
import storyController from './Controller/storyController'
import suffleController from './Controller/suffleController'

import express from "express";
let app = express();


app.use("/api/flow", flowController)
app.use("/api/profile", profileController)
app.use("/api/story", storyController)
app.use("/api/suffle", suffleController)


let server = app.listen(9081, function() {
    // var host = server.address().;
    var port = server.address().port;

    console.log("let me show you something real mode (%s) http://localhost:%s ", app.settings.env, port);
})