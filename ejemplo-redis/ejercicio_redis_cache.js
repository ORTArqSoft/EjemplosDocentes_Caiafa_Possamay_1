const express   = require('express');
const app       = express();

require('dotenv').config();
const PORT = process.env.PORT;
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

// https://github.com/axios/axios
const axios = require('axios')

// ToDo: modularizar con express.Router.
app.get('/comentarios', async function (req, res, next) {
    //si no existe clave comentarios, la creo y devuelvo.
    let random = Math.random();
    console.time(`CACHE-HIT-${random}`);
    const comentarios = await RedisClient.get("comentarios");
    //si clave vacía => null.
    if(!comentarios){
        console.time(`CACHE-MISS-${random}`);
        // https://jsonplaceholder.typicode.com/
        axios
        .get('https://jsonplaceholder.typicode.com/comments/')
        .then(async response => {
            console.timeEnd(`CACHE-MISS-${random}`);
            await RedisClient.set('comentarios', JSON.stringify(response.data));
            res.json({mensaje:'cache miss', data:response.data,});
        })
        .catch(error => {
            console.error(error);
        })
    }
    else{
        console.timeEnd(`CACHE-HIT-${random}`);
        res.json({mensaje:'cache hit', data:JSON.parse(comentarios)});
    }
});

app.get('/comentarios/:id', async function (req, res, next) {
    const id = req.params.id;
    try{
        if(!id){
            throw new Error('Id requerido');
        }
        const redisId = `comentario?${id}`;
        let random = Math.random();
        console.time(`CACHE-HIT-${random}`);
        const comentario = await RedisClient.get(redisId);
        if(!comentario){
            console.time(`CACHE-MISS-${random}`);
            axios
            .get('https://jsonplaceholder.typicode.com/comments/', {params:{id:id}})
            .then(async response => {
                console.timeEnd(`CACHE-MISS-${random}`);
                await RedisClient.set(redisId, JSON.stringify(response.data));
                res.json({mensaje:'cache miss', data:response.data,});
            })
            .catch(error => {
                console.error(error);
            });
        }
        else{
            console.timeEnd(`CACHE-HIT-${random}`);
            res.json({mensaje:'cache hit', data:JSON.parse(comentario)});
        }
    }
    catch(e){
        res.json({error:e.message})
    }
});


app.listen(PORT, () => {
    console.log(`Escuchando puerto ${PORT}`);
});