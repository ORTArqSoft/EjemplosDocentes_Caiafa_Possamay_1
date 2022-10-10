const { EJSON } = require('bson');
const moongoose = require('mongoose');
const Schema    = moongoose.Schema

// implementar herencia entre esquemas, por ej. actor y director heredan de persona.
const actorSchema = new Schema({
    // validaciones built-in
    nombre: {
        type : String,
        required: [true, 'requerido'],
        maxlength: [100, 'máximo 100 caracteres']
    },
    apellido:{
        type:String,
        required: [true, 'requerido'],
    },
    edad:{
        type:Number
    },
});

module.exports = actorSchema;