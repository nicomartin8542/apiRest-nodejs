const jwt = require("jsonwebtoken");

//===================
//Verifica Token
//===================
let verificaToken = (req, res, next) => {
    //recibo token de los headers del request
    let token = req.get("Authorization");

    //Verifico el token enviado con el secret.
    jwt.verify(token, process.env.SEED_AUTH, (err, encoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no valido",
                },
            });
        }

        req.usuario = encoded.usuario;
        next();
    });
};

//=====================
//Verifica que el usuario sea administrador
//===================
let verificaAdmin = (req, res, next) => {
    let usuario = req.usuario;
    console.log(usuario);
    if (usuario.role !== "ADMIN_ROLE") {
        return res.status(401).json({
            ok: false,
            err: {
                message: "Usuario no autorizado",
            },
        });
    }

    next();
};

module.exports = {
    verificaToken,
    verificaAdmin,
};