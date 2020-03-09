'use strict';
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

/**********************
 *  Load AWS SDK for JavaScript
 *  to interact with AWS DynamoDB*
 **********************/

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const cors = require('cors');

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());


// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE,PUT");
  next()
});

app.options('*', cors()); // include before other routes


// get all events associated with a performer id
app.get('/performers/:id/events/', function (req, res) {
  console.log("GET EVENTS by id...", req);

  const performerId = req.params.id;

  // create dynamo db params
  const params = {
    TableName: process.env.DYNAMODB_EVENTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: 'performer_id-id-index',
    KeyConditionExpression: "performer_id = :performer_id",
    ExpressionAttributeValues: {
      ":performer_id": performerId
    },
  };

  console.log('Params ARE : ', params);

  // res.json({
  //   message: "params are" + params,
  //   response: params
  // })

  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log("result is", result)
      const response = {
        statusCode: 200,
        body: result.Items,
      };
      res.json({
        // success: 'Found ' + items_by_event_id.length + ' records where event_id=' + params.Key.event_id,
        success: 'Found all events for performer id: ' + performerId,
        response: response
      })
    }
  });

});


// get all venues associated with a performer id
app.get('/performers/:id/venues/', function (req, res) {
  console.log("GET VENUES by id...", req);

  const performerId = req.params.id;

  // create dynamo db params
  const params = {
    TableName: process.env.DYNAMODB_VENUES_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: 'performer_id-id-index',
    KeyConditionExpression: "performer_id = :performer_id",
    ExpressionAttributeValues: {
      ":performer_id": performerId
    },
  };

  console.log('Params ARE : ', params);

  // res.json({
  //   message: "params are" + params,
  //   response: params
  // })

  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log("result is", result)
      const response = {
        statusCode: 200,
        body: result.Items,
      };
      res.json({
        // success: 'Found ' + items_by_event_id.length + ' records where event_id=' + params.Key.event_id,
        success: 'Found all venues for performer id: ' + performerId,
        response: response
      })
    }
  });

});



app.listen(3000, function () {
  console.log("My Request API...")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
