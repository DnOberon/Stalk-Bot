var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send({
    "islandCode": "DOGJ38",
    "turnipPrice": 589
  });
});

app.post('/', function(req, res) {
  res.send(200);
});


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
