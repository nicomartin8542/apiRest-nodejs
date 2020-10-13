const express = require("express");
const bcript = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
const app = express();

//===================================================================================================
//Login tradicional
//===================================================================================================
app.post("/login", (req, resp) => {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                err: err,
            });
        }

        if (!usuarioDB) {
            return resp.status(400).json({
                ok: false,
                message: "El usuario o contraseña no son validos",
            });
        }

        if (!bcript.compareSync(body.password, usuarioDB.password)) {
            return resp.status(400).json({
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

//===================================================================================================
//Login por google
//===================================================================================================

//configuraciones de google signin: Verifico token enviado por login en google
let verify = async(token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    };
};

app.post("/google", async(req, resp) => {
    let token = req.body.Authorization;

    let googleUsuario = await verify(token).catch((e) => {
        let err = `${e}`;
        return resp.status(403).json({
            ok: false,
            err,
        });
    });

    Usuario.findOne({ email: googleUsuario.email }, (err, usuarioDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                err: err,
            });
        }

        //si encuentra el usuario
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return resp.status(400).json({
                    ok: false,
                    err: {
                        message: "Debe logearse de manera normal",
                    },
                });
            } else {
                //genero token
                let token = jwt.sign({ usuarioDB }, process.env.SEED_AUTH, {
                    expiresIn: process.env.CADUCIDAD_TOKEN,
                });

                return resp.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });
            }
        }

        //Si no existe creo usuario logeado por google
        let usuario = new Usuario({
            email: googleUsuario.email,
            nombre: googleUsuario.nombre,
            img: googleUsuario.img,
            google: true,
            password: "ingreso por google",
        });

        usuario.save((err, usuarioDB) => {
            if (err) {
                return resp.status(500).json({
                    ok: false,
                    err: err,
                });
            }

            let token = jwt.sign({ usuarioDB }, process.env.SEED_AUTH, {
                expiresIn: process.env.CADUCIDAD_TOKEN,
            });

            resp.json({
                ok: true,
                usuario: usuarioDB,
                token,
            });
        });
    });
});

module.exports = app;