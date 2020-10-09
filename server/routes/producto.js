const express = require('express');

const Producto = require('../models/producto');

const { verificaToken } = require('../middlewares/autenticacion');

const _ = require('underscore');

const app = express();



//===============================================
//Mostrar todos los productos: GET
//===============================================
app.get('/producto', verificaToken, (req, resp) => {

    Producto.find({ disponible: true })
        .sort('nombre')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {
            if (err) {
                resp.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!producto) {
                resp.status(400).json({
                    ok: false,
                    err: {
                        message: 'Sin registros'
                    }
                })
            }

            resp.json({
                ok: true,
                producto
            })
        })

});

//===============================================
//Mostrar todos los productos por termino
//===============================================
app.get('/producto/buscar/termino=:termino', verificaToken, (req, resp) => {

    let termino = req.params.termino;

    //creo expresion regular para busucar segun el termino recibido
    let regEx = RegExp(termino, 'i');

    Producto.find({ nombre: regEx })
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {

            if (err) {
                resp.status(500).json({
                    ok: false,
                    err
                });
            }

            resp.json({
                ok: true,
                producto
            })
        })
})

//===============================================
//Mostrar producto por ID: GET
//===============================================
app.get('/producto/id=:id', verificaToken, (req, resp) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {
            if (err) {
                resp.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!producto) {
                resp.status(400).json({
                    ok: false,
                    err: {
                        message: 'Sin registros'
                    }
                })
            }

            resp.json({
                ok: true,
                producto
            })
        })
});


//===============================================
//Crear un producto: POST
//===============================================
app.post('/producto', verificaToken, (req, resp) => {

    let body = req.body;
    let idUsuer = req.usuario._id;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: idUsuer
    })

    producto.save((err, producto) => {

        if (err) {
            resp.status(500).json({
                ok: false,
                err
            })
        }

        resp.status(201).json({
            ok: true,
            producto
        });
    });
});


//===============================================
//Actualizar un producto por ID: GET
//===============================================
app.put('/producto/id=:id', verificaToken, (req, resp) => {

    let id = req.params.id;
    let body = {
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion: req.body.descripcion,
        categoria: req.body.categoria,
        disponible: req.body.disponible,
    };

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {

            if (err) {
                resp.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!producto) {
                resp.status(500).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            }

            resp.json({
                ok: true,
                producto
            })
        })
});

//===============================================
//Desabilitar un producto por ID: DELETE
//===============================================
app.delete('/producto/id=:id', verificaToken, (req, resp) => {

    let id = req.params.id;
    let body = {
        disponible: false
    }
    Producto.findByIdAndUpdate(id,
        body, { new: true, runValidators: true },
        (err, producto) => {
            if (err) {
                resp.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!producto) {
                resp.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            }

            resp.json({
                ok: true,
                producto
            })
        });


});

module.exports = app;