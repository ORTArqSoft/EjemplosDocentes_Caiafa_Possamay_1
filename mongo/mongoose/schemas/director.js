const moongoose = require('mongoose');
const Schema    = moongoose.Schema

const directorSchema = new Schema({
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

module.exports = directorSchema;