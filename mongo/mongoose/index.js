const express   = require('express');
const app       = express();

// https://mongoosejs.com/docs/
const mongoose  = require('mongoose');
const RestError = require('./routes/rest-error');
const pelicula     = require('./routes/pelicula');
const actor     = require('./routes/actor');
const director     = require('./routes/director');

// https://www.npmjs.com/package/dotenv
require('dotenv').config();
const uri = process.env.MONGODB_URI;

// https://mongoosejs.com/docs/5.x/docs/deprecations.html
const options = {useNewUrlParser:true, useUnifiedTopology: true}; 

// Ejemplos de conexión

//Promise
mongoose.connect(uri, options).then(() => {
    console.log('Conectado a DB...');
}).catch(error => {
    console.log('Hubo un error de conexion', error.message);
});

mongoose.connect(uri, options).catch(error => {
    console.log('Hubo un error de conexion', error.message);
});

//Eventos
mongoose.connection.on('error', error => {
    console.log('Hubo un error de conexion', error.message);   
});

//Callback
/*
mongoose.connect(uri, options, function (error) {
    if(error){
        console.log('Hubo un error de conexión', error.message);
    }
}); 
*/

app.use(express.json());
app.use(pelicula);
app.use(actor);
app.use(director);

app.use((err,req ,res, next) => {
    res.status(err instanceof RestError? err.status: 500);
    res.json({error:err.message});
});

app.listen(process.env.PORT, function(){
    console.log(`Escuchando puerto ${process.env.PORT}`);
});