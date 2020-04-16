"use strict";
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
const uuid = require("uuid");
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

/**********************
 *  Load AWS SDK for JavaScript
 *  to interact with AWS DynamoDB*
 **********************/

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const cors = require("cors");

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE,PUT");
  next();
});

app.options("*", cors()); // include before other routes

/**********************
 * GET all events associated with a performer id with a specific status
 **********************/
app.get("/performers/:id/events", function (req, res, next) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  const performerId = req.params.id;
  const eventStatus = req.query.status;
  let params;

  if (debug) console.log("GET: /performers/:id/events request object", req);

  // Set up query //
  if (eventStatus) {
    if (debug) console.log("PerformerId:", performerId);
    if (debug) console.log("Event status:", eventStatus);

    // create params
    params = {
      TableName: process.env.DYNAMODB_EVENTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
      IndexName: "performerId-date-index",
      KeyConditionExpression: "performerId = :performerId",
      FilterExpression: "#status = :eventStatus",
      ExpressionAttributeValues: {
        ":performerId": performerId,
        ":eventStatus": eventStatus,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };
  } else {
    if (debug) console.log("performerId:", performerId);

    // create params
    params = {
      TableName: process.env.DYNAMODB_EVENTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
      IndexName: "performerId-date-index",
      KeyConditionExpression: "performerId = :performerId",
      ExpressionAttributeValues: {
        ":performerId": performerId,
      },
    };
  }
  // Print constructed params //
  if (debug) console.log("Params:\n", params);

  // fetch requests from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential Dynamo db server errors
    if (error) {
      console.error(
        "Unable to find item(s). Error JSON:",
        JSON.stringify(error, null, 2)
      );
      next("error in performers/:id/events", error);
    } else {
      // Print the result
      if (debug) console.log("Result:\n", result);

      if (result.Items.length >= 1) {
        // setup a successful response
        const successfulResponse = {
          statusCode: 200,
          body: result.Items,
        };
        if (eventStatus) {
          res.json({
            success:
              "Found all " +
              eventStatus +
              " events for performer id: " +
              performerId,
            response: successfulResponse,
          });
        } else {
          res.json({
            success: "Found all events for performer id: " + performerId,
            response: successfulResponse,
          });
        }
      } else {
        // setup a successful response
        const unsuccessfulResponse = {
          statusCode: 204,
          body: result.Items,
        };
        if (eventStatus) {
          res.json({
            success:
              "Found no " +
              eventStatus +
              " events for performer id: " +
              performerId,
            response: unsuccessfulResponse,
          });
        } else {
          res.json({
            success: "Found no events for performer id: " + performerId,
            response: unsuccessfulResponse,
          });
        }
      }
    }
  });
});

/**********************
 * GET all venues associated with a performer id
 **********************/
app.get("/performers/:id/venues", function (req, res, next) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  const performerId = req.params.id;
  if (debug) console.log("GET: /performers/:id/venues request object", req);

  // create dynamo db params
  const params = {
    TableName: process.env.DYNAMODB_VENUES_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: "performerId-id-index",
    KeyConditionExpression: "performerId = :performerId",
    ExpressionAttributeValues: {
      ":performerId": performerId,
    },
  };
  if (debug) console.log("Params ARE : ", params);

  // fetch requests from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential Dynamo db server errors
    if (error) {
      console.error(
        "Unable to find item(s). Error JSON:",
        JSON.stringify(error, null, 2)
      );
      next("error in performers/:id/venues", error);
    } else {
      // Print the result
      if (debug) console.log("Result:\n", result);

      if (result.Items.length >= 1) {
        // setup a successful response
        const successfulResponse = {
          statusCode: 200,
          body: result.Items,
        };
        res.json({
          success: "Found all venues for performer id: " + performerId,
          response: successfulResponse,
        });
      } else {
        // setup an unsuccessful response
        const unsuccessfulResponse = {
          statusCode: 204,
          body: result.Items,
        };
        res.json({
          success: "Found no venues for performer id: " + performerId,
          response: unsuccessfulResponse,
        });
      }
    }
  });
});

/**********************
 * GET requests by performer id possibly with a specific status
 **********************/
app.get("/performers/:id/requests", function (req, res, next) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  const performerId = req.params.id;
  const requestStatus = req.query.status;
  let params;

  if (debug) console.log("GET: /performers/:id/requests request object", req);

  // Set up query //
  if (requestStatus) {
    if (debug) console.log("PerformerId:", performerId);
    if (debug) console.log("Status:", requestStatus);

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: "performerId-modifiedOn-index",
      KeyConditionExpression: "performerId = :performerId",
      FilterExpression: "#status = :requestStatus",
      ExpressionAttributeValues: {
        ":performerId": performerId,
        ":requestStatus": requestStatus,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };
  } else {
    if (debug) console.log("performerId:", performerId);

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: "performerId-modifiedOn-index",
      KeyConditionExpression: "performerId = :performerId",
      ExpressionAttributeValues: {
        ":performerId": performerId,
      },
    };
  }

  // Print constructed params //
  if (debug) console.log("Params:\n", params);

  // fetch requests from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential Dynamo db server errors
    if (error) {
      console.error(
        "Unable to find item(s). Error JSON:",
        JSON.stringify(error, null, 2)
      );
      next("error in performers/:id/requests", error);
    } else {
      // Print the result
      if (debug) console.log("Result:\n", result);

      if (result.Items.length >= 1) {
        // setup a successful response
        const successfulResponse = {
          statusCode: 200,
          body: result.Items,
        };
        if (requestStatus) {
          res.json({
            success:
              "Found all " +
              requestStatus +
              " requests for performer id: " +
              performerId,
            response: successfulResponse,
          });
        } else {
          res.json({
            success: "Found all requests for performer id: " + performerId,
            response: successfulResponse,
          });
        }
      } else {
        // setup an unsuccessful response
        const unsuccessfulResponse = {
          statusCode: 204,
          body: result.Items,
        };
        if (requestStatus) {
          res.json({
            success:
              "Found no " +
              requestStatus +
              " requests for performer id: " +
              performerId,
            response: unsuccessfulResponse,
          });
        } else {
          res.json({
            success: "Found no requests for performer id: " + performerId,
            response: unsuccessfulResponse,
          });
        }
      }
    }
  });
});

app.listen(3000, function () {
  console.log("My Request API...");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
