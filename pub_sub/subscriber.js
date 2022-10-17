const express = require("express")
const redis = require("redis")

const subscriber = redis.createClient()
subscriber.connect()

const app = express()

subscriber.subscribe('test', (message) => {
  console.log(message);
});

app.get("/", (req, res) => {
  res.send("Me suscribi")
})

app.listen(3001, () => {
  console.log("Arriba escuchando 3001")
})