const express   = require('express');
const app       = express();

const mongoose  = require('mongoose');
const RestError = require('./routes/rest-error');
const pelicula   = require('./routes/pelicula');

require('dotenv').config();
const uri = process.env.MONGODB_URI;
const jwt = require('jsonwebtoken'); 
const fs = require('fs');
// https://mongoosejs.com/docs/5.x/docs/deprecations.html
const options = {useNewUrlParser:true, useUnifiedTopology: true}; 

mongoose.connect(uri, options).catch(error => {
    console.log('Error', error.message);
});

mongoose.connection.on('error', error => {
    console.log('Error', error.message);   
});


//creamos middleware de express para verificar cada request.
const verify = function(req, res, next){
    //recibimos el token enviado por header.
    const authHeader = req.headers['authorization']; 
    if(!authHeader){
        next(new RestError('unauthorized', 401));
    }
    //cliente de API envia Authorization: Bearer 1234 
    const token = authHeader.split(' ')[1]; 
    if(!token){
        next(new RestError('unauthorized', 401));
    }
    const PUBLIC_KEY  = fs.readFileSync('./public.key', 'utf8');
    jwt.verify(token, PUBLIC_KEY, {algorithm:  "RS256"}, function(err, usr){ 
        if(err){
            next(new RestError(err.message, 401));
        }
        else{
            //agregamos el usuario a instancia de request para tenerlo disponible en solicitudes subsiguientes. 
            req.user = usr;
            next();
        }
    }); 
}

app.use(express.json());
app.use(verify);
app.use(pelicula);

app.use((err,req ,res, next) => {
    res.status(err instanceof RestError? err.status: 500);
    res.json({error:err.message});
});

app.listen(process.env.PORT, function(){
    console.log(`Escuchando puerto ${process.env.PORT}`);
});