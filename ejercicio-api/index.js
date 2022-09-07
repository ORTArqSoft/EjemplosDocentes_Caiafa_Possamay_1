const express   = require('express');
const app       = express();

let peliculas = [];

class RestError extends Error{
    constructor(message, status){
        super(message)
        this.status = status;
    }
}

app.use(express.json());

app.get('/peliculas', function(req, res){
    res.json(peliculas);
    res.status(200);   
});

app.get('/peliculas/:id', function(req, res){
    const id = req.params.id;
    const pelicula =  peliculas.find(pelicula => pelicula.id == id);
    if(!pelicula){
        throw new RestError('Recurso no encontado', 404);
    }
    res.json(pelicula);
});

app.post('/peliculas', function(req, res){
    const nombre = req.body.nombre;
    const anio   = req.body.anio;
    const id     = peliculas.length + 1
    const pelicula       = {nombre:nombre, anio:anio, id:id}
    peliculas.push(pelicula);
    res.status(201);
    res.json(pelicula);
});

app.put('/peliculas/:id', function(req, res){
    const id        = req.params.id;
    const nombre    = req.body.nombre;
    const anio      = req.body.anio;
    let  pelicula   = peliculas.find(pelicula => pelicula.id == id);
    if(!pelicula){
        throw new RestError('Recurso no encontado', 404);
    }
    pelicula.nombre = nombre;
    pelicula.anio   = anio;
    res.json(pelicula);
});

app.delete('/peliculas/:id', function(req, res){
    const id = req.params.id;
    const index = peliculas.findIndex(pelicula => pelicula.id == id);
    if (index < 0){
        throw new RestError('Recurso no encontado', 404);    
    }
    peliculas.splice(index, 1);
    res.status(204);
    res.json();
});

app.use((err,req,res,next) => {
    res.status(err instanceof RestError? err.status: 500);
    res.json({error:err.message});
});

app.listen(3000, function(){
    console.log('Escuchando puerto 3000');
});