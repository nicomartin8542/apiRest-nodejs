const express = require("express");
const bcript = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const app = express();

app.post("/login", (req, resp) => {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            resp.status(500).json({
                ok: false,
                err: err,
            });
        }

        if (!usuarioDB) {
            resp.status(400).json({
                ok: false,
                message: "El usuario o contraseña no son validos",
            });
        }

        if (!bcript.compareSync(body.password, usuarioDB.password)) {
            resp.status(400).json({
                ok: false,
                message: "El usuario o contraseña no son validos",
            });
        }

        //Genero el token con el objeto usuario, el secret y la fecha de expiracion
        let token = jwt.sign({
                usuario: usuarioDB,
            },
            process.env.SEED_AUTH, { expiresIn: process.env.CADUCIDAD_TOKEN }
        );
        resp.json({
            ok: true,
            usuario: usuarioDB,
            token,
        });
    });
});

module.exports = app;