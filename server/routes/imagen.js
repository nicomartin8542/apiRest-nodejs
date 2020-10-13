const express = require('express');
const fs = require('fs');
const path = require('path');
const { verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();


app.get('/image/tipo=:tipo&img=:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    let noImage = path.resolve(__dirname, '../assets/no-image.jpg');

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        res.sendFile(noImage);
    }
});

module.exports = app;