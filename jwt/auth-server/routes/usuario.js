const mongoose  = require('mongoose');
const express   = require('express');
const Router    = express.Router()
const RestError = require('./rest-error');

const Usuario = mongoose.model('Usuario', require('../schemas/usuario'));

Router.post('/usuarios', function(req, res, next){
    Usr = new Usuario({
        nombre:req.body.nombre, 
        apellido:req.body.apellido, 
        email:req.body.email,
        password:req.body.password
    });
    Usr.save(function(err, doc){
        if(err){
            //error de base de datos.
            let http_code = (err.code == 11000)?409:400;
            next(new RestError(err.message, http_code));
        }
        else{
            doc.password = undefined;
            res.json(doc);
        }
    });
});

module.exports = Router