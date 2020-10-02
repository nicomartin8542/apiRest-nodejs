require("./config/config.js");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//rutas del usuario
app.use(require("./routes/usuario"));

//conexion a la base de datos
mongoose.connect(
    process.env.URLDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    },
    (err, res) => {
        if (err) throw new Error(err);
        console.log("Base de datos ONLINE");
    }
);

app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto", process.env.PORT);
});