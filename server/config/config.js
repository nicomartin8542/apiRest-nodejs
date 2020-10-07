//==================
//Puerto: produccion || desarrollo
//==================
process.env.PORT = process.env.PORT || 3000;

//==================
//Vencimiento del token: 30 dias.
//==================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//==================
//SEED de autenticacion
//==================
process.env.SEED_AUTH = process.env.SEED_PROD || "seed-desarrollo";

//==================
//Entorno: produccion || desarrollo
//==================
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

//==================
//Url conexion base de datos: Prodccion/desarrollo
//==================
let urlDB;
if (process.env.NODE_ENV === "dev") {
    urlDB = "mongodb://localhost:27017/cafe";
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;