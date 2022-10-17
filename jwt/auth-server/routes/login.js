const mongoose  = require('mongoose');
const express   = require('express');
const Router    = express.Router()
const RestError = require('./rest-error');

const crypto = require('crypto'); 
const Usuario = mongoose.model('Usuario', require('../schemas/usuario'));
const jwt = require('jsonwebtoken'); 
const fs = require('fs');

Router.post('/login', function(req, res, next){
    const usr = req.body.usuario;
    let pwd = req.body.password;

    if(!usr){
        next(new RestError('usuario requerido para continuar', 400));    
    }
    else if(!pwd){
        next(new RestError('password requerido para continuar', 400));     
    }
    pwd = crypto.createHash('sha256').update(pwd).digest('hex'); 
    Usuario.findOne({email:usr, password:pwd}, function(err, doc){
        if(err){
            next(new RestError(err, 409));        
        }
        else if(!doc){
            next(new RestError('usuario o password no válidos', 401)); 
        }
        else{
            doc.password = undefined;
            //payload: datos utilizados para firmar con private key y enviar token. 
            const PRIVATE_KEY  = fs.readFileSync('./private.key', 'utf8');
            const token = jwt.sign(JSON.stringify(doc), PRIVATE_KEY, {algorithm:  "RS256"});
            res.json({token:token});
        }
    })
});

module.exports = Router