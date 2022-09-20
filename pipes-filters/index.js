const axios = require('axios');
const Pipeline = require('pipes-and-filters');
const pipeline = Pipeline.create('validación teléfono')
require('dotenv').config();
const API_KEY = process.env.API_KEY;

const fs = require('fs');
if(!fs.existsSync('telefonos.json')){
    let telefonos = [];
    fs.writeFileSync('telefonos.json', JSON.stringify(telefonos));
}
let rawdata = fs.readFileSync('telefonos.json');
telefonos = JSON.parse(rawdata);

// filtros
let validar_digitos = function(input, next){
    const pattern = /^(?:[+\d].*\d|\d)$/
    if(!pattern.test(input)){
        return next(Error('Formato no válido'));   
    }
    next(null, input); 
};

let validar_numero = function(input, next){
    let config = {
        headers: {
            apikey: API_KEY,
        }
    }
    axios.get(`https://api.apilayer.com/number_verification/validate?number=${input}`, config)
    .then(function (response) {
        if(!response.data.valid){
            return next(Error('Número no válido')); 
        }
        // handle success
        next(null, input); 
    })
};

let validar_registro = function(input, next){
    if(telefonos.find(telefono => telefono.numero == input)){
        return next(Error('Número registrado'));     
    }
    next(null, input); 
}

// pipeline
const input = process.argv[2];
pipeline.use(validar_digitos);
pipeline.use(validar_numero);
pipeline.use(validar_registro);
pipeline.execute(input);


let grabar_telefono = function(result){
    let data = {numero:result};
    telefonos.push(data);
    fs.writeFileSync('telefonos.json', JSON.stringify(telefonos));
}


// error handler, si hay error se corta la canalización.
pipeline.once('error', function(err) {
    console.error(err);
});
 
// end handler, para recibir una notificación cuando se complete la canalización.
pipeline.once('end', function(result) {
    console.log('completado');
    grabar_telefono(result);
});



