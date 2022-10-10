const mongoose  = require('mongoose');
const express   = require('express');
const Router    = express.Router()
const RestError = require('./rest-error');

//modelo "wrapper" de schema para dar comportamiento de acceso a datos.
const Actor = mongoose.model('Actor', require('../schemas/actor'));

Router.post('/actores', function(req, res, next){
    A = new Actor({
        nombre:req.body.nombre, 
        apellido:req.body.apellido, 
        edad:req.body.edad}
    );
    A.save(function(err, doc){
        if(err){
            //error de base de datos.
            let http_code = (err.code == 11000)?409:400;
            next(new RestError(err.message, http_code));
        }
        else{
            res.json(doc);
        }
    });
});

Router.get('/actores', function(req, res, next){
    Query = Actor.find({});
    Query.sort({nombre:1});
    Query.exec(function(err, docs){
        if(!err){
            res.json(docs);
        }
    });
});

module.exports = Router