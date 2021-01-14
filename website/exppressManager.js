// import Login from './website/Login'
import router from "./router/_router";

import path from "path";
import express from "express";
import hbs from "express-hbs";
import bodyParser from "body-parser";
let app = express();

// view engine setup
app.set("views", path.join(__dirname, "website/views"));
app.set("view engine", "hbs");
app.engine(
    "hbs",
    hbs.express4({
        // helpers: hbsHelpers,
        partialsDir: __dirname + "/website/views/partials",
        layoutsDir: __dirname + "/website/views/layouts",
        beautify: false,
    })
);

// first
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "website/public")));
// app.use("/login", Login)

app.use("/", router);

let server = app.listen(9081, function() {
    var port = server.address().port;

    console.log("WEB: http://localhost:%s ", port);
    console.log("API: http://localhost:%s/api ", port);
    console.log("MODE: (%s) ", app.settings.env);
});