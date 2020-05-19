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

/**********************
 *  Load AWS SDK for JavaScript
 *  to interact with AWS DynamoDB*
 **********************/

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**********************
 * GET all method *
 **********************/
app.get("/venues", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");

  if (debug) console.log("GET all venues request:\n", req);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };
  if (debug) console.log("Params:\n", params);

  // fetch venue from the database
  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(
        "Unable to find items. Error JSON:",
        JSON.stringify(error, null, 2)
      );
    } else {
      // create a response
      const response = {
        statusCode: 200,
        body: result,
      };
      if (debug) console.log("Response:\n", response);

      res.json({
        success: "Successfully found records from the venues table!",
        response: response,
      });
    }
  });
});

/**********************
 * GET by id method *
 **********************/
app.get("/venues/:id", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  const venueId = req.params.id;

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: venueId,
    },
  };
  if (debug) console.log("Params:\n", params);

  // fetch venue from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(
        "Unable to find item. Error JSON:",
        JSON.stringify(error, null, 2)
      );
    } else {
      if (debug) console.log("Result:\n", result);
      if ("Item" in result && "id" in result.Item) {
        // create a response
        const response = {
          statusCode: 200,
          body: result,
        };
        if (debug) console.log("Response:\n", response);

        res.json({
          success:
            "Successfully found record with id: " +
            venueId +
            " in the venue table!",
          response: response,
        });
      } else {
        res.json({
          message:
            "Unable to find record, please check venue id " +
            venueId +
            " was entered correctly... ",
          invalid_id: venueID,
        });
      }
    }
  });
});

/****************************
 * Post method *
 ****************************/
app.post("/venues", function (req, res) {
  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: req.body,
  };

  // Convert empty strings to null for dynamoDB
  params.Item.name = params.Item.name === "" ? null : params.Item.name;
  params.Item.streetAddress =
    params.Item.streetAddress === "" ? null : params.Item.streetAddress;
  params.Item.city = params.Item.city === "" ? null : params.Item.city;
  params.Item.state = params.Item.state === "" ? null : params.Item.state;
  params.Item.postalCode =
    params.Item.postalCode === "" ? null : params.Item.postalCode;
  params.Item.country = params.Item.country === "" ? null : params.Item.country;
  params.Item.url = params.Item.url === "" ? null : params.Item.url;

  // Generate uuid & date record
  params.Item.id = uuid.v1();
  params.Item.createdOn = new Date().toJSON();
  params.Item.modifiedOn = new Date().toJSON();

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
      };
      res.json({
        success: "Successfully added item to the venues table!",
        record: response.body,
      });
    }
  });
});

/****************************
 * Patch method *
 ****************************/
app.put("/venues", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  if (debug) console.log("UPDATE venue request...", req);

  // update item with modified date
  let item = req.body;
  item.modifiedOn = new Date().toJSON();

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: item,
  };
  if (debug) console.log("Params:\n", params);

  // Convert empty strings to null for dynamoDB
  params.Item.name = params.Item.name === "" ? null : params.Item.name;
  params.Item.streetAddress =
    params.Item.streetAddress === "" ? null : params.Item.streetAddress;
  params.Item.city = params.Item.city === "" ? null : params.Item.city;
  params.Item.state = params.Item.state === "" ? null : params.Item.state;
  params.Item.postalCode =
    params.Item.postalCode === "" ? null : params.Item.postalCode;
  params.Item.country = params.Item.country === "" ? null : params.Item.country;
  params.Item.url = params.Item.url === "" ? null : params.Item.url;

  if (debug) console.log("Params:\n", params);

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
      };
      res.json({
        success: "Successfully added item to the venues table!",
        record: response.body,
      });
    }
  });
});

/****************************
 * DELETE method *
 ****************************/

app.delete("/venues", function (req, res) {
  console.log("DELETE EVENT REQUEST...", req.body);

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
        success: "delete call for venues table succeeded!",
        response: response,
      });
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
