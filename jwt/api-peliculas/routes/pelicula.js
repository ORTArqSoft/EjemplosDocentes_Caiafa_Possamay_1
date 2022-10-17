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
        creadaPor: {
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            email: req.user.email
        }
    });
    P.save(function(err, doc){
        if(err){
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

module.exports = Router