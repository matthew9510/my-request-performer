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

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
});

/**********************
 *  Load AWS SDK for JavaScript
 *  to interact with AWS DynamoDB*
 **********************/

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**********************
 * GET method *
 **********************/

app.get('/transactions', function(req, res) {
  console.log("GET REQUEST...", req);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: req.query.id,
    },
  };

  // fetch event from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      if ("Item" in result && "id" in result.Item) {
        // create a response
        const response = {
          statusCode: 200,
          body: result.Item,
        };
        res.json({success: 'Successfully found item in the transactions table!', response: response.body})
      } else {
        res.json({
          message: 'Unable to find record, please check id was entered correctly... ',
          invalid_id: params.Key.id
        })
      }
    }
  });
});

/****************************
 * PUT method *
 ****************************/

app.put('/transactions', function(req, res) {

  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: req.body
  };

  // Generate uuid & date record
  params.Item.id = uuid.v1();
  params.Item.date_created = new Date().toJSON().slice(0, 10);

  dynamoDb.put(params, function(err, result) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: params.Item,
      };
      res.json({success: 'Successfully added item to the transactions table!', record: response.body})
    }
  });
});

/****************************
 * DELETE method *
 ****************************/

app.delete('/transactions', function(req, res) {
  console.log("DELETE EVENT REQUEST...", req.body);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: req.query.id,
    },
  };

  dynamoDb.delete(params, function(err, result) {
    if (err) {
      console.error("Unable to DELETE item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: req.body,
      };
      res.json({success: 'delete call for transactions table succeeded!', response: response});
    }
  });
});

/****************************
 * PATCH method *
 ****************************/

app.patch('/transactions', function(req, res) {
  console.log("UPDATE EVENT REQUEST...", req);

  // create params
  const params = {
    TableName: table,
    Key: {
      id: req.query.id,
    },
    UpdateExpression: "set #n = :val1",
    ExpressionAttributeValues:{":val1":req.query.name},
    ExpressionAttributeNames:{"#n": "name"},
    ReturnValues:"UPDATED_NEW"
  };

  dynamoDb.update(params, function(err, result) {
    if (err) {
      console.error("Unable to Update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: result,
      };
      res.json({success: 'UPDATE for record on transactions table succeeded!', response: response.body});
    }
  });
});

app.listen(3000, function() {
  console.log("My Request API...")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
