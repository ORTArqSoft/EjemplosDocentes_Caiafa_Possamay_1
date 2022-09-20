const axios = require('axios');
const Pipeline = require('pipes-and-filters');
const pipeline = Pipeline.create('validación teléfono');
require('dotenv').config();
const API_KEY = process.env.API_KEY;
// https://www.npmjs.com/package/redis
const Redis = require('redis');
const RedisClient = Redis.createClient();

// se conecta a bd por defecto, se puede especificar en que base de datos/puerto se crea la instancia.
RedisClient.on('connect', function() {
    console.log('Cliente conectado');
});

RedisClient.on('error', function(err) {
    console.log('Error =>',err);
});

// ToDo: pasarlo a un middleware de express.js para asegurarnos que no se haga ningún request antes de conectarnos.
RedisClient.connect();
// dump.rdb => snapshot de la base.

// filtros
let validar_digitos = async function(input, next){
    const pattern = /^(?:[+\d].*\d|\d)$/;
    let valido = pattern.test(input);
    let message = await RedisClient.get(input);
    if(!message){
        message = {validar_digitos:valido};
    }
    else{
        message = JSON.parse(message);
        message['validar_digitos'] = valido;
    }
    await RedisClient.set(input, JSON.stringify(message));
    next(null, input); 
};

let validar_numero = function(input, next){
    let config = {
        headers: {
            apikey: API_KEY,
        }
    }
    axios.get(`https://api.apilayer.com/number_verification/validate?number=${input}`, config)
    .then(async function (response) {
        let valido = response.data.valid
        let message = await RedisClient.get(input);
        if(!message){
            message = {validar_numero:valido};
        }
        else{
            message = JSON.parse(message);
            message['validar_numero'] = valido;
        }
        await RedisClient.set(input, JSON.stringify(message));
        next(null, input); 
    }).catch(function (error) {
        console.log('Error=>', error.response.data.message);
    });
};

let validar_registro = async function(input, next){
    let existe = await RedisClient.SISMEMBER('telefonos', input);
    let message = await RedisClient.get(input);
    if(!message){
        message = {validar_registro:!existe};
    }
    else{
        message = JSON.parse(message);
        message['validar_registro'] = !existe;
    }
    await RedisClient.set(input, JSON.stringify(message));
    next(null, input);
}

let grabar_telefono = async function(input){
    let data = await RedisClient.get(input);
    data = JSON.parse(data);
    if(data.validar_registro && data.validar_numero && data.validar_digitos){
        //set.
        await RedisClient.SADD('telefonos', input);
        console.log('Cliente registrado');
    }
    else{
        console.log('Cliente no registrado');
    }
    console.log(data);
}

// pipeline
const input = process.argv[2];
pipeline.use(validar_digitos);
pipeline.use(validar_numero);
pipeline.use(validar_registro);
pipeline.execute(input);

// error handler, si hay error se corta la canalización.
pipeline.once('error', function(err) {
    console.error(err);
});

// end handler, para recibir una notificación cuando se complete la canalización.
pipeline.once('end', function(result) {
    grabar_telefono(result);
});
