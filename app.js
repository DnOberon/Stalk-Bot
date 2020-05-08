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


app.get('/', function(req, res) {
    res.send({
      "islandCode": "DOGJ38",
      "turnipPrice": 589,
    });
});

app.post('/', function(req, res) {
    docClient = getDynamoClient()

    var payload = {
      TableName: "stalk-bot",
      Item: {
        "islandCode": req.body.islandCode,
        "turnipPrice": req.body.turnipPrice,
        "ttl": Math.floor((Date.now() + (30 * 60 * 1000)) / 1000)
      }
    }

  docClient.put(payload, function(err, data) {
    if (err) {

      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      res.sendStatus(500);
      return;

    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }

    res.sendStatus(200);
  })
});


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
