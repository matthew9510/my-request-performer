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

function customSort(request1, request2) {
  const obj1LatestDate = request1.hasOwnProperty('modifiedOn') ? request1.modifiedOn : request1.createdOn
  const obj2LatestDate = request2.hasOwnProperty('modifiedOn') ? request2.modifiedOn : request2.createdOn
  return new Date(obj1LatestDate) - new Date(obj2LatestDate);
}

/**********************
 * GET all method *
 **********************/
app.get('/requests', function (req, res) {
  console.log("GET all requests request:\n", req);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };
  console.log('Params:\n', params);

  // fetch event from the database
  dynamoDb.scan(params, (error, result) => {
    // Sort requests in chronological order
    result.Items = result.Items.sort(customSort)

    // handle potential errors
    if (error) {
      console.error("Unable to find items. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      // create a response
      const response = {
        statusCode: 200,
        body: result,
      };
      console.log("Response:\n", response);

      res.json({
        success: 'Successfully found records from the requests table!',
        response: response
      })
    }
  });
});

/**********************
 * GET by id method *
 **********************/
app.get('/requests/:id', function (req, res) {
  console.log("GET requests by id request:\n", req);

  const requestId = req.params.id;

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: requestId
    },
  };
  console.log('Params:\n', params);

  // fetch event from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log('Result:\n', result)
      if ("Item" in result && "id" in result.Item) {
        // create a response
        const response = {
          statusCode: 200,
          body: result,
        };
        console.log("Response:\n", response)

        res.json({
          success: 'Successfully found record with id: ' + requestId + ' in the events table!',
          response: response
        })
      } else {
        res.json({
          message: 'Unable to find record, please check event id ' + requestId + ' was entered correctly... ',
          invalid_id: requestId
        })
      }
    }
  })
});


/****************************
 * POST method *
 ****************************/

app.post('/requests', function (req, res) {

  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: req.body
  };

  // Generate uuid & date record
  params.Item.id = uuid.v1();
  params.Item.createdOn = new Date().toJSON()

  dynamoDb.put(params, function (err, result) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: params.Item,
      };
      res.json({
        success: 'Successfully added item to the requests table!',
        record: response.body
      })
    }
  });
});

/****************************
 * DELETE method *
 ****************************/

app.delete('/requests', function (req, res) {
  console.log("DELETE REQUEST RECORD...", req.body);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: req.query.id,
    },
  };

  dynamoDb.delete(params, function (err, result) {
    if (err) {
      console.error("Unable to DELETE item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: req.body,
      };
      res.json({
        success: 'delete call for requests table succeeded!',
        response: response
      });
    }
  });
});

/****************************
 * PATCH method *
 ****************************/
// requires the body to be the item to update
app.put('/requests/:id', function (req, res) {
  console.log("UPDATE event request...", req);

  const requestId = req.params.id;

  // update item with modified date 
  let item = req.body;
  item.modifiedOn = new Date().toJSON();

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: item
  };
  console.log('Params:\n', params);

  // Note if table item is being updated then the result will be the new item
  dynamoDb.put(params, function (err, result) {
    console.log("Result:", result)
    if (err) {
      console.error("Unable to Update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: params.Item,
      };
      console.log('Response:\n', response);

      res.json({
        success: 'UPDATE for record on requests table succeeded!',
        response: response.body
      });
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
