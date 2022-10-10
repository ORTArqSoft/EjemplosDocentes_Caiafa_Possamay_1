const moongoose = require('mongoose');
const Schema    = moongoose.Schema

const peliSchema = new Schema({
    creado: Date,
    titulo:{
        type:String,
        // validaciones built-in
        required: [true, 'requerido'],
        maxlength: [20,'máximo 20 caracteres'],
        unique:true
    },
    anio:{
        type: Number,
        required: [true, 'requerido'],
        // validaciones custom
        validate:{
            validator: (value) => {
                //formato de value yyyy
                if(!/^[\d]{4}$/.test(value)){
                    return false;
                }
                //validar que no sea mayor al año actual.
                if(new Date().getFullYear() < value){
                    return false;
                }
            },
            message: props => `${props.value} no es válido, se espera formato YYYYY y menor a año actual`
        }
    },
    genero:{
        type:String,
        required: [true, 'requerido'],
        enum:{
            values:['ACCION','TERROR','COMEDIA'],
            message: '{VALUE} no válido'
        }
    },
    idioma:{
        type:String,
        match:[/^[a-zA-Z]{2}$/ ,'idioma no válido, se espera dos caracteres']
    },
    // const actorSchema = require('./actor');
    // const directorSchema = require('./director');
    // => tipo esquema sin referencia.
    // actores: [actorSchema],
    // director:{directorSchema}

    // => tipo esquema con referencia.
    director:{
        type: Schema.Types.ObjectId,
        ref: 'Director' 
    },
    actores: [{
        type: Schema.Types.ObjectId, 
        ref: 'Actor'
        }
    ]
});

//eventos
peliSchema.pre('save', function(next) {
    this.creado = Date();
    next();
});

peliSchema.post('save', function(doc) {
    console.log(`Se grabo documento con fecha ${doc.creado}`);
}); 

//métodos de schema.
//instancia
peliSchema.methods.queSoy = function(){
    const hoy = new Date()
    return (this.anio == hoy.getFullYear())?'Premiere!':'Old Movie!'
}

//estático
peliSchema.statics.queSoy = function(){
    return 'No hay instancia de película aún...'
} 

module.exports = peliSchema