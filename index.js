const axios = require('axios');

const list_locales = async function(response, cb){
    const locales = response.data;
    await cb(locales);
    console.log('Fin proceso...');
}

const log = function(iterable){
    iterable.forEach(function(obj){
        for (const val of Object.values(obj)) {
            console.log(val);
        }
        console.log('---------------------');
    });
}

function get_locales(login) {
    const token = login.data.token;
    const headers = {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    const url = 'https://ort-tddm.herokuapp.com/locales/';
    return axios.get(url, headers);
}

function login(usuario, pwd) {
    const headers = {
        headers: { "Content-type": "application/json" }
    };
    const datos = {
        usuario: usuario.data.email,
        password: pwd
    }
    const url = 'https://ort-tddm.herokuapp.com/login';
    return axios.post(url, datos, headers);
}

(function(email){
    const url = 'https://ort-tddm.herokuapp.com/usuarios';
    const datos = {
        "password": "123",
        "email":email,
        "nombre": "Fernando",
        "apellido": "Canosa",
        "sexo": "M"
    }
    const headers = {
        headers: { "Content-type": "application/json" }
    };

    axios.post(url, datos, headers)
        .then(response => login(response, datos.password))
        .then(response => get_locales(response))
        .then(response => list_locales(response, log))
        .catch(function (error) {
            console.log('Error', error.response.data.error);
        });
})(process.argv[2]);

// ej.
// node index test@example.com