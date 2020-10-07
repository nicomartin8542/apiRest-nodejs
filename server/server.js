require("./config/config.js");

const express = require("express");
const mongoose = require("mongoose");
const app = express();

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json. Funcion para obtener un objeto json en el body del request
app.use(express.json());

//rutas de nuestra api
app.use(require("./routes/index"));

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

//levantar servidor en el puerto especificado en congif.js
app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto", process.env.PORT);
});