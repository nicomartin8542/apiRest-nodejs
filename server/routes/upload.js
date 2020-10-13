const { response } = require('express');
const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
const app = express();

// default options
app.use(fileUpload());

app.put('/upload/tipo=:tipo&id=:id', function(req, res) {

    //recupero variables de url
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No hay archivos seleccionados'
            }
        });
    }

    //valido tipo enviado por url
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El tipo es invalido. Tipos permitidos: ' + tiposValidos.join(', ')
            }
        })
    }

    //recupero archivo y extension del misomo
    let archivo = req.files.archivo;
    let nombreSplit = archivo.name.split('.');
    let extension = nombreSplit[nombreSplit.length - 1];

    //Valido extensiones
    let extensionesVal = ['jpg', 'png', 'gif', 'jpeg'];

    if (extensionesVal.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'La extencion no es valida. Extensiones validas: ' + extensionesVal.join(', '),
                ext: extension
            }
        });
    }

    //Armo nombre de archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Guardo imagen en carpeta
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        //guardo nombre de imagen en DB
        if (tipo === 'usuarios') {
            usuarioImagen(id, res, nombreArchivo);
        } else {
            productoImagen(id, res, nombreArchivo);
        }
    });
});

let usuarioImagen = (id, res, nombreArchivo) => {

    let tipo = 'usuarios';
    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borrarImagen(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borrarImagen(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        //borro imagen usuario, si existe
        borrarImagen(usuarioDB.img, tipo);

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioDB) => {
            res.json({
                ok: true,
                usuario: usuarioDB,
                img: nombreArchivo
            });
        });
    });
}

let productoImagen = (id, res, nombreArchivo) => {

    let tipo = 'productos';

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borrarImagen(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borrarImagen(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        //Borra imagen producto, si existe
        borrarImagen(productoDB.img, tipo);

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoDB) => {
            res.json({
                ok: true,
                producto: productoDB,
                img: nombreArchivo
            })
        })
    });
}


let borrarImagen = (nombreArchivo, tipo) => {
    let pathUrl = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);
    if (fs.existsSync(pathUrl)) {
        fs.unlinkSync(pathUrl);
    }
}

module.exports = app;