const express   = require('express');
const app       = express();

const mongoose  = require('mongoose');
const RestError = require('./routes/rest-error');
const usuario   = require('./routes/usuario');
const login     = require('./routes/login');

require('dotenv').config();
const uri = process.env.MONGODB_URI;
// https://mongoosejs.com/docs/5.x/docs/deprecations.html
const options = {useNewUrlParser:true, useUnifiedTopology: true}; 

mongoose.connect(uri, options).catch(error => {
    console.log('Error', error.message);
});

mongoose.connection.on('error', error => {
    console.log('Error', error.message);   
});

app.use(express.json());
app.use(usuario);
app.use(login);

app.use((err,req ,res, next) => {
    res.status(err instanceof RestError? err.status: 500);
    res.json({error:err.message});
});

app.listen(process.env.PORT, function(){
    console.log(`Escuchando puerto ${process.env.PORT}`);
});