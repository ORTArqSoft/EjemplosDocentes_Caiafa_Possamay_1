const express = require('express');
const redis = require('redis');

const publisher = redis.createClient()
publisher.connect()

const app = express()

app.get("/", (req, res) => {
    const message = {
        msg: "Esto es lo que esta escrito en redis"
    }

    publisher.publish('test', JSON.stringify(message))
    res.send("Publicamos en REDIS");
})

app.listen(3000, () => {
    console.log('Arriba escuchando 3000');
})