const express = require("express");
const Usuario = require("../models/usuario");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const {
    verificaToken,
    verificaAdmin,
} = require("../middlewares/autenticacion");
const app = express();

//GET
app.get("/usuarios", verificaToken, (req, res) => {
    //parametros opcionales
    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;

    //el segundo pametro del find puede excluir los campos que solamente se quiera mostrar
    Usuario.find({ estado: true }, "nombre email role google img")
        .skip(Number(desde))
        .limit(Number(limite))
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            //Funcion de mongo para tener la cantidad de la lista obtenida
            Usuario.countDocuments({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo,
                });
            });
        });
});

//POST
app.post("/usuarios", [verificaToken, verificaAdmin], (req, res) => {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

//PUT
app.put("/usuarios/:id", [verificaToken, verificaAdmin], (req, res) => {
    let id = req.params.id;
    //Filtro los campos que se tienen que actualizar con la funcion pick de paquete underscore
    let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

    //Funcion de mongo para modificar un registro
    Usuario.findByIdAndUpdate(
        id,
        body, { new: true, runValidators: true },
        (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Usuario no encontrado",
                    },
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
            });
        }
    );
});

//DELETE
app.delete("/usuarios/:id", [verificaToken, verificaAdmin], (req, res) => {
    let id = req.params.id;

    //funcion para filtrar los campos que quiero actualizar
    //let body = _.pick(req.body, ["estado"]);

    let cambiarEstado = {
        estado: false,
    };

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) =>{})
    Usuario.findByIdAndUpdate(
        id,
        cambiarEstado, { new: true },
        (err, usuarioDes) => {
            //cambio estado a false para desabilitar el usuario

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!usuarioDes) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Usuario no encontrado",
                    },
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDes,
            });
        }
    );
});

module.exports = app;