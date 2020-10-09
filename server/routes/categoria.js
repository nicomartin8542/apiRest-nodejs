const express = require("express");
const Categoria = require("../models/categoria");
const _ = require("underscore");
const {
    verificaToken,
    verificaAdmin,
} = require("../middlewares/autenticacion");
const app = express();

//===============================================
//Mostrar todas las categorias GET
//===============================================
app.get("/categoria", verificaToken, (req, resp) => {
    Categoria.find()
        .sort("descripcion")
        .populate("usuario", "nombre email")
        .exec((err, categoriaDB) => {
            if (err) {
                resp.status(500).json({
                    ok: false,
                    err,
                });
            }

            if (!categoriaDB) {
                resp.status(400).json({
                    ok: false,
                    err: {
                        message: "No hay categorias disponibles",
                    },
                });
            }

            resp.json({
                ok: true,
                categorias: categoriaDB,
            });
        });
});

//===============================================
//Mostrar una categoria por id GET
//===============================================
app.get("/categoria/id=:id", verificaToken, (req, resp) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            resp.status(500).json({
                ok: false,
                err,
            });
        }

        if (!categoriaDB) {
            resp.status(400).json({
                ok: false,
                error: {
                    message: "No se encontro la categoria",
                },
            });
        }

        resp.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

//===============================================
//Crear Categorias por POST
//===============================================
app.post("/categoria", verificaToken, (req, resp) => {
    let idUsuario = req.usuario._id;
    let categoria = new Categoria({
        descripcion: req.body.descripcion,
        usuario: idUsuario,
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            resp.status(500).json({
                ok: false,
                err,
            });
        }

        resp.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

//===============================================
//Modificar una Categoria por PUT
//===============================================
app.put("/categoria/id=:id", verificaToken, (req, resp) => {
    let id = req.params.id;
    let body = _.pick(req.body, ["descripcion"]);

    Categoria.findByIdAndUpdate(
        id,
        body, {
            new: true, //devuelve el nuevo objeto modificado
            runValidators: true, //aplica las validaciones del esquema del modelo
            context: "query", //necesario para las disparar las val de mongoose-unique-validator
        },
        (err, categoriaDB) => {
            if (err) {
                resp.status(500).json({
                    ok: false,
                    err,
                });
            }

            if (!categoriaDB) {
                resp.status(400).json({
                    ok: false,
                    err: {
                        menssage: "No existe el recurso a modificar",
                    },
                });
            }

            resp.json({
                ok: true,
                categoria: categoriaDB,
            });
        }
    );
});

//===============================================
//Eliminar una categoria con DELETE
//===============================================
app.delete("/categoria/id=:id", [verificaToken, verificaAdmin], (req, resp) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            resp.status(500).json({
                ok: false,
                err,
            });
        }

        if (!categoriaDB) {
            resp.status(400).json({
                ok: false,
                err: {
                    message: "No se encontro el recurso a eliminar",
                },
            });
        }

        resp.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

module.exports = app;