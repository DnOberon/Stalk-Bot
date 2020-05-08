var express = require('express');
var app = express();
var bodyParser = require("body-parser")

const { Pool} = require('pg')
const pool = new Pool()

app.use(bodyParser.json())

function islandCodeValid(islandCode) {
    // Could we combine all these if statements into one? Sure, but
    // I like being explicit
    if(typeof  islandCode !== "string") return false

    if(islandCode.length > 5) return false

    if(!/^[a-z0-9]+$/i.test(islandCode)) return false

    return true
}

app.get('/', function(req, res) {
    // pull in only non-expired, and below requested threshold islands
    pool.query(`SELECT * FROM stalks WHERE requested < 15 AND NOW() < (created_at + (30 * interval '1 minute')) ORDER BY turnip_price DESC LIMIT 1;`)
        .then((resp) => {
           if(resp.rows && resp.rows.length <= 0) {
               res.status(500).json({"error": "no islands registered"})
               return
           }

           // update the retrieved island
           if(resp.rows) {
              pool.query({
                  text: 'UPDATE stalks SET requested = $1 WHERE id = $2',
                  values: [resp.rows[0].requested + 1, resp.rows[0].id]
              })
                  .then(() => {
                      res.status(200).json(resp.rows[0])
                      return
                  })
                  .catch(err => {
                      console.log(err)
                      res.status(500).json({"error": err})
                      return
                  })
           }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({"error": err})
            return
        })
    return;
});

app.post('/', function(req, res) {

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
        text:'INSERT INTO stalks(island_code,turnip_price,requested) VALUES($1,$2,$3)',
         values:[req.body.islandCode, price, 0]
    })
    .then(() => {
     res.status(200).send();
     return;
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({"error": err})
        return
    })
});


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
