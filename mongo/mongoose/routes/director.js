const mongoose  = require('mongoose');
const express   = require('express');
const Router    = express.Router()
const RestError = require('./rest-error');

const Director = mongoose.model('Director', require('../schemas/director'));

Router.post('/directores', function(req, res, next){
    D = new Director({
        nombre:req.body.nombre, 
        apellido:req.body.apellido, 
        edad:req.body.edad}
    );
    D.save(function(err, doc){
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

Router.get('/directores', function(req, res, next){
    Query = Director.find({});
    Query.sort({nombre:1});
    Query.exec(function(err, docs){
        if(!err){
            res.json(docs);
        }
    });
});

module.exports = Router