const mongoose = require("mongoose");
const uniqueRequeire = require("mongoose-unique-validator");
let Schema = mongoose.Schema;

const cateroriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, "El campo es obligatorio"],
    },

    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
    },
});

//Agrego plugin para controlar el campos unicos
cateroriaSchema.plugin(uniqueRequeire, {
    menssage: "El campo {PATH} debe ser unico",
});

module.exports = mongoose.model("Categoria", cateroriaSchema);