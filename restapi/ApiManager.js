import flowController from './Controller/flowController'
import profileController from './Controller/profileController'
import storyController from './Controller/storyController'
import suffleController from './Controller/suffleController'
import accountController from './Controller/accountController'

import express from "express";
import bodyParser from 'body-parser'
let app = express();

// first
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/flow", flowController)
app.use("/api/profile", profileController)
    // app.use("/api/story", storyController)
app.use("/api/suffle", suffleController)
app.use("/api/account", accountController)

let server = app.listen(9081, function() {
    // var host = server.address().;
    var port = server.address().port;

    console.log("let me show you something real mode (%s) http://localhost:%s ", app.settings.env, port);
})