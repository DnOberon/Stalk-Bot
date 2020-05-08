var express = require('express');
var app = express();
var AWS = require("aws-sdk")
var bodyParser = require("body-parser")

app.use(bodyParser.json())

function getDynamoClient() {
  AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
  })

 return new AWS.DynamoDB.DocumentClient()
}

function islandCodeValid(islandCode) {
    // Could we combine all these if statements into one? Sure, but
    // I like being explicit
    if(typeof  islandCode !== "string") return false

    if(islandCode.length > 5) return false

    if(!/^[a-z0-9]+$/i.test(islandCode)) return false

    return true
}

app.get('/', function(req, res) {
    res.send({
      "islandCode": "DOGJ38",
      "turnipPrice": 589,
    });
});

app.post('/', function(req, res) {
    docClient = getDynamoClient()

    if(!islandCodeValid(req.body.islandCode)) {
        res.status(500).json({"error":"invalid island code"})
        return
    }

    if(req.body.turnipPrice > 1000) {
        res.status(500).json({"error":"invalid turnip price, too high"})
        return
    }

    var payload = {
      TableName: "stalk-bot",
      Item: {
        "islandCode": req.body.islandCode.toUpperCase(),
        "turnipPrice": req.body.turnipPrice,
        "ttl": Math.floor((Date.now() + (30 * 60 * 1000)) / 1000)
      }
    }

  docClient.put(payload, function(err, data) {
    if (err) {
      res.status(500).json({"error": "Unable to add item. Error JSON:".concat(JSON.stringify(err, null, 2))});
      return;
    }

    res.sendStatus(200);
  })
});


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
