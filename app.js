var express = require('express');
var app = express();
var bodyParser = require("body-parser")

const { Pool} = require('pg')

app.use(bodyParser.json())
console.log(process.env)

function islandCodeValid(islandCode) {
    // Could we combine all these if statements into one? Sure, but
    // I like being explicit
    if(typeof  islandCode !== "string") return false

    if(islandCode.length > 5) return false

    if(!/^[a-z0-9]+$/i.test(islandCode)) return false

    return true
}

app.get('/', function(req, res) {
   res.status(500).json({"error": "No islands available"})
   return;
});

app.post('/', function(req, res) {
    const pool = new Pool()

    if(!islandCodeValid(req.body.islandCode)) {
        res.status(500).json({"error":"invalid island code"})
        return
    }

    price = parseInt(req.body.turnipPrice, 10)

    if(price > 1000) {
        res.status(500).json({"error":"invalid turnip price, too high"})
        return
    }

    pool.query({
        text:'INSERT INTO stalks(islandCode,turnipPrice,requested) VALUES($1,$2,$3)',
         values:[req.body.islandCode, price, 0]
    })
        .then(() => {
         res.statusCode(200);
         return;
        })
        .catch(err => {
            res.status(500).json({"error": err})
        })
});


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
