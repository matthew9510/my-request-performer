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
// Enable CORS Pre-Flight
app.options("*", cors()); // include before other routes

/**********************
 *  Load AWS SDK for JavaScript
 *  to interact with AWS DynamoDB*
 **********************/

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**********************
 * GET method *
 **********************/

app.get("/requester/:id", function (req, res) {
  const requesterId = req.params.id;
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  if (debug) console.log("GET REQUEST...", req);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: requesterId,
    },
  };

  // fetch requester from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(
        "Unable to find item. Error JSON:",
        JSON.stringify(error, null, 2)
      );
    } else {
      if ("Item" in result && "id" in result.Item) {
        // create a response
        const response = {
          statusCode: 200,
          body: result.Item,
        };
        res.json({
          success:
            "Successfully found item " +
            params.Key.id +
            " in the requester table!",
          response: response.body,
        });
      } else {
        res.json({
          message:
            "Unable to find record, please check id was entered correctly... ",
          invalid_id: params.Key.id,
          statusCode: 204,
        });
      }
    }
  });
});

/****************************
 * Post method *
 ****************************/

app.post("/requester/:id", function (req, res) {
  const requesterId = req.params.id;

  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: req.body,
  };

  // Generate uuid & date record
  params.Item.id = requesterId;
  let currentDate = new Date().toJSON();
  params.Item.createdOn = currentDate;
  params.Item.modifiedOn = currentDate;

  dynamoDb.put(params, function (err, result) {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      const response = {
        statusCode: 200,
        body: params.Item,
        success: "Successfully added item to the requester table!",
      };
      res.json(response);
    }
  });
});

/****************************
 * DELETE method *
 ****************************/

app.delete("/requester", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");

  if (debug) console.log("DELETE requester REQUEST...", req.body);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: req.query.id,
    },
  };

  dynamoDb.delete(params, function (err, result) {
    if (err) {
      console.error(
        "Unable to DELETE item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      const response = {
        statusCode: 200,
        body: req.body,
      };
      res.json({
        success: "delete call for requester table succeeded!",
        response: response,
      });
    }
  });
});

/****************************
 * PATCH method *
 ****************************/

app.patch("/requester/:id", function (req, res) {
  const requesterId = req.params.id;

  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");

  if (debug) console.log("UPDATE requester REQUEST...", req);

  let modifiedOn = new Date().toJSON();

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: requesterId,
    },
    UpdateExpression:
      "set acknowledgementOfMerchant = :acknowledgementOfMerchant, modifiedOn = :modifiedOn",
    ExpressionAttributeValues: {
      ":acknowledgementOfMerchant": req.body.acknowledgementOfMerchant,
      ":modifiedOn": modifiedOn,
    },
    ReturnValues: "UPDATED_NEW",
  };

  dynamoDb.update(params, function (err, result) {
    if (err) {
      console.error(
        "Unable to Update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      const response = {
        statusCode: 200,
        body: result,
        success:
          "UPDATE for record " +
          req.query.id +
          " on requester table succeeded!",
      };
      res.json({
        response,
      });
    }
  });
});

/**********************
 * GET requests by requester id possibly with a specific status
 **********************/
app.get("/requester/:id/requests", function (req, res, next) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  const requesterId = req.params.id;
  const requestStatus = req.query.status;
  const eventId = req.query.eventId;
  let params;

  if (debug) console.log("GET: /requesters/:id/requests request object", req);

  // Set up query //
  if (eventId && requestStatus) {
    if (debug) console.log("requesterId:", requesterId);
    if (debug) console.log("eventId:", eventId);
    if (debug) console.log("Status:", requestStatus);

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: "requesterId-createdOn-index",
      KeyConditionExpression: "requesterId = :requesterId",
      FilterExpression: "eventId = :eventId and #status = :requestStatus",
      ExpressionAttributeValues: {
        ":requesterId": requesterId,
        ":eventId": eventId,
        ":requestStatus": requestStatus,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };
  } else if (requestStatus) {
    if (debug) console.log("requesterId:", requesterId);
    if (debug) console.log("Status:", requestStatus);

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: "requesterId-createdOn-index",
      KeyConditionExpression: "requesterId = :requesterId",
      FilterExpression: "#status = :requestStatus",
      ExpressionAttributeValues: {
        ":requesterId": requesterId,
        ":requestStatus": requestStatus,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };
  } else if (eventId) {
    if (debug) console.log("requesterId:", requesterId);
    if (debug) console.log("eventId:", eventId);

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: "requesterId-createdOn-index",
      KeyConditionExpression: "requesterId = :requesterId",
      FilterExpression: "eventId = :eventId",
      ExpressionAttributeValues: {
        ":requesterId": requesterId,
        ":eventId": eventId,
      },
    };
  } else {
    if (debug) console.log("requesterId:", requesterId);

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: "requesterId-createdOn-index",
      KeyConditionExpression: "requesterId = :requesterId",
      ExpressionAttributeValues: {
        ":requesterId": requesterId,
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
      next("error in requester/:id/requests", error);
    } else {
      // Print the result
      if (debug) console.log("Result:\n", result);

      if (result.Items.length >= 1) {
        // setup a successful response
        const successfulResponse = {
          statusCode: 200,
          body: result.Items,
        };
        if (requestStatus && eventId) {
          res.json({
            success:
              "Found all " +
              requestStatus +
              " requests for requester id: " +
              requesterId +
              " with the event id of " +
              eventId,
            response: successfulResponse,
          });
        } else if (requestStatus) {
          res.json({
            success:
              "Found all " +
              requestStatus +
              " requests for requester id: " +
              requesterId,
            response: successfulResponse,
          });
        } else if (eventId) {
          res.json({
            success:
              "Found all requests for requester id: " +
              requesterId +
              " with the event id of" +
              eventId,
            response: successfulResponse,
          });
        } else {
          res.json({
            success: "Found all requests for requester id: " + requesterId,
            response: successfulResponse,
          });
        }
      } else {
        // set up an unsuccessful response
        const unsuccessfulResponse = {
          statusCode: 204,
          body: result.Items,
        };
        if (requestStatus && eventId) {
          res.json({
            error:
              "Found no " +
              requestStatus +
              " requests for requester id: " +
              requesterId +
              "with the event id of " +
              eventId,
            response: unsuccessfulResponse,
          });
        } else if (requestStatus) {
          res.json({
            error:
              "Found no " +
              requestStatus +
              " requests for requester id: " +
              requesterId,
            response: unsuccessfulResponse,
          });
        } else if (eventId) {
          res.json({
            error:
              "Found no requests for requester id: " +
              requesterId +
              "with the event id of " +
              eventId,
            response: unsuccessfulResponse,
          });
        } else {
          res.json({
            error: "Found no requests for requester id: " + requesterId,
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
