const moongoose = require('mongoose');
const Schema    = moongoose.Schema;
const crypto = require('crypto'); 


const usuarioSchema = new Schema({
    nombre: {
        type : String,
        required: [true, 'requerido']
    },
    apellido:{
        type:String,
        required: [true, 'requerido'],
    },
    email:{
        type:String,
        required: [true, 'requerido'],
        unique:true
    },
    password:{
        type:String,
        required: [true, 'requerido'],
    },
});

// evento para encriptar antes de grabar.
usuarioSchema.pre('save', function(next) {
    this.password = crypto.createHash('sha256').update(this.password).digest('hex'); 
    next();
});

module.exports = usuarioSchema;