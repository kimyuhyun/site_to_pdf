const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

app.use(bodyParser.json({ limit: "30000kb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use("/pdf", express.static(path.join(__dirname, "pdf")));

app.use("/", require("./routes/index"));

// error handler
app.use(function (err, req, res, next) {
    console.log("ENV", process.env.NODE_ENV);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    app.locals.hostname = process.env.HOST_NAME;

    if (process.env.NODE_ENV == "development") {
        console.error(err.stack);
        // render the error page
        res.status(err.status || 500);
        res.render("error");
    }
});

module.exports = app;