const mongoose  = require('mongoose');
const express   = require('express');
const Router    = express.Router()
const RestError = require('./rest-error');

const Pelicula = mongoose.model('Pelicula', require('../schemas/pelicula'));

Router.post('/peliculas', function(req, res, next){
    P = new Pelicula({
        titulo:req.body.titulo,
        anio:req.body.anio,
        genero:req.body.genero,
        actores:req.body.actores,
        director:req.body.director}
    );
    P.save(function(err, doc){
        if(err){
            //error de base de datos.
            //responsabilidad de conocer http code se le puede asignar a RestError.
            let http_code = (err.code == 11000)?409:400;
            next(new RestError(err.message, http_code));
        }
        else{
            res.json(doc);
        }
    });
});

Router.get('/peliculas', function(req, res, next){
    let queryParams = {};
    match = {};
    if(req.query.edad){
        match = {edad: {$eq : parseInt(req.query.edad)}};
    }
    if(req.query.anio){
        queryParams['anio'] = req.query.anio;
    }
    if(req.query.genero){
        queryParams['genero'] = req.query.genero;
    }
    Query = Pelicula.find(queryParams);
    // chaining syntax
    Query.populate({
        path: 'actores',
        match: match,
        options: {sort: {nombre:1}},
        select:'-_id'
        // por ej. si fuera many2many.
        // populate: {
        //     path: 'peliculas', 
        //     model: 'Pelicula', 
        //     select:'-actores'
        // }
    });
    Query.populate({
        path: 'director',
        match: match,
        options: {sort: {nombre:1}},
        select:'-_id'
    });

    Query.sort({titulo:1});
    Query.exec(function(err, docs){
        if(!err){
            res.json(docs);
        }
    });
});

Router.get('/peliculas/:id', function(req, res, next){
    const id    = req.params.id;
    Query     = Pelicula.findById(id);
    // chaining syntax
    Query.populate({
        path: 'actores',
        options: {sort: {nombre:1}},
        select:'-_id'
    });
    Query.populate({
        path: 'director',
        options: {sort: {nombre:1}},
        select:'-_id'
    });
    
    Query.exec(function(err, doc){
        if(!err){
            if(doc){
                res.json({doc:doc,queSoy:doc.queSoy()});
            }
            else{
                next(new RestError('recurso no encontrado', 404));
            }
        }
        else{
            next(new RestError(err.message, 500));
        }
    });
});

Router.put('/peliculas/:id', function(req, res, next){
    const id = req.params.id;
    const options = {new:true, runValidators:true};
    Pelicula.findByIdAndUpdate(id, {titulo:req.body.titulo,anio:req.body.anio,genero:req.body.genero}, options, function(err, doc){
        if(!err){
            if(doc){
                res.json(doc);
            }
            else{
                next(new RestError('recurso no encontrado', 404));
            }
        } 
        else{
            next(new RestError(err.message, 400));
        }
    });
});

Router.delete('/peliculas/:id', function(req, res, next){
    const id = req.params.id;
    Pelicula.findByIdAndDelete(id, function(err, doc){
        if(!err){
            if(doc){
                res.status(204);
                res.json();
            }
            next(new RestError('recurso no encontrado', 404));
        }
    });
});



module.exports = Router