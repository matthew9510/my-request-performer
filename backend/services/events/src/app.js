"use strict";

/**********************
 *  Import Libraries
 **********************/
const uuid = require("uuid");
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const cors = require("cors");

//  Load AWS SDK for JavaScript to interact with AWS DynamoDB
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// declare a new express app
const app = express();

const stage = process.env.STAGE;

/**********************
 *   Middleware
 **********************/
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

/**********************
 *   CORS
 **********************/
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
 * GET all method *
 **********************/
app.get("/events", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");

  if (debug) console.log("GET all events request:\n", req);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };
  if (debug) console.log("Params:\n", params);

  // fetch event from the database
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
        success: "Successfully found records from the events table!",
        response: response,
      });
    }
  });
});

/**********************
 * GET by id method *
 **********************/
app.get("/events/:id", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  const eventId = req.params.id;

  if (debug) console.log("GET events by id request:\n", req);
  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: eventId,
    },
  };
  if (debug) console.log("Params:\n", params);

  // fetch event from the database
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
            eventId +
            " in the events table!",
          response: response,
        });
      } else {
        if (debug) console.log("result of an non existent event", result); // response will be empty
        res.json({
          message:
            "Unable to find record, please check event id " +
            eventId +
            " was entered correctly... ",
          invalid_id: eventId,
          statusCode: 204,
        });
      }
    }
  });
});

/**********************
 * GET requests by event id
 **********************/
app.get("/events/:id/requests", function (req, res, next) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  const eventId = req.params.id;
  const requestStatus = req.query.status;
  let params;

  if (debug) console.log("GET: /events/:id/requests request object", req);

  // Set up query //
  if (requestStatus) {
    if (debug) console.log("EventId:", eventId);
    if (debug) console.log("Status:", requestStatus);

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: "eventId-createdOn-index",
      KeyConditionExpression: "eventId = :eventId",
      FilterExpression: "#status = :requestStatus",
      ExpressionAttributeValues: {
        ":eventId": eventId,
        ":requestStatus": requestStatus,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    // alters the sort of the payload
    if (requestStatus === "accepted")
      params.IndexName = "eventId-modifiedOn-index";
  } else {
    if (debug) console.log("EventId:", eventId);

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: "eventId-createdOn-index",
      KeyConditionExpression: "eventId = :eventId",
      ExpressionAttributeValues: {
        ":eventId": eventId,
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
      next("error in events/:id/requests", error);
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
              " requests for event id: " +
              eventId,
            response: successfulResponse,
          });
        } else {
          res.json({
            success: "Found all requests for event id: " + eventId,
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
              " requests for event id: " +
              eventId,
            response: unsuccessfulResponse,
          });
        } else {
          res.json({
            success: "Found no requests for event id: " + eventId,
            response: unsuccessfulResponse,
          });
        }
      }
    }
  });
});

/****************************
 * POST method *
 ****************************/

app.post("/events", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");

  if (debug) console.log("POST events request:\n", req);

  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: req.body,
  };

  // Convert empty strings to null for dynamoDB
  params.Item.title = params.Item.title === "" ? null : params.Item.title;
  params.Item.description =
    params.Item.description === "" ? null : params.Item.description;
  params.Item.coverFee =
    params.Item.coverFee === "" ? null : params.Item.coverFee;
  params.Item.genre = params.Item.genre === "" ? null : params.Item.genre;
  params.Item.url = params.Item.url === "" ? null : params.Item.url;
  params.Item.venueId = params.Item.venueId === "" ? null : params.Item.venueId;

  if (debug) console.log("Params:\n", params);

  // Generate uuid & date record
  let currentDate = new Date().toJSON();
  params.Item.createdOn = currentDate;
  params.Item.modifiedOn = currentDate;
  params.Item.id = uuid.v1();

  // Note if table item is being inserted for the first time, the result will be empty
  dynamoDb.put(params, function (err, result) {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      return res.status(500).json({
        message: "Not able to add event to events table",
      });
    } else {
      // Publish AWS IOT for frontend clients to go get these db changes
      try {
        var iotdata = new AWS.IotData({
          endpoint: "a2983euzfbsfbz-ats.iot.us-west-2.amazonaws.com",
        });
      } catch (error) {
        console.log("Couldn't create iotData client error", error);
        return res
          .status(500)
          .json({ message: "Couldn't create iotData client error" });
      }

      // Publish to necessary iot websockets to go poll these changes
      var paramsIOT = {
        topic: "myRequest-events-" + stage,
        payload: JSON.stringify({ data: "Poll events Please" }),
        qos: 0,
      };

      if (debug) console.log("created IOT params", paramsIOT);

      // Publish to necessary iot websocket to trigger appropriate db calls
      iotdata.publish(paramsIOT, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          return res.status(500).json({
            message: "Not able to publish to IOT after saving event to table",
          });
        } else {
          const response = {
            statusCode: 200,
            body: params.Item,
          };
          if (debug) console.log("Response:\n", response);
          res.json({
            success: "Successfully added item to the events table!",
            record: response.body,
          });
        }
      });
    }
  });
});

/****************************
 * PATCH method *
 ****************************/
// requires the body to be the item to update
app.put("/events/:id", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");

  if (debug) console.log("UPDATE event request...", req);

  const eventId = req.params.id;

  // update item with modified date
  let item = req.body;
  item.modifiedOn = new Date().toJSON();

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: item,
    ReturnValues: "ALL_OLD",
  };

  // Convert empty strings to null for dynamoDB
  params.Item.title = params.Item.title === "" ? null : params.Item.title;
  params.Item.description =
    params.Item.description === "" ? null : params.Item.description;
  params.Item.coverFee =
    params.Item.coverFee === "" ? null : params.Item.coverFee;
  params.Item.genre = params.Item.genre === "" ? null : params.Item.genre;
  params.Item.url = params.Item.url === "" ? null : params.Item.url;
  params.Item.venueId = params.Item.venueId === "" ? null : params.Item.venueId;

  if (debug) console.log("Params:\n", params);

  // Note if table item is being updated then the result will be the new item
  dynamoDb.put(params, function (err, result) {
    if (debug) console.log("Result:", result);
    if (err) {
      console.error(
        "Unable to Update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      return res.status(500).json({
        message: "Not able to update event in events table",
      });
    } else {
      // Publish to necessary iot websockets to trigger appropriate db calls
      try {
        var iotdata = new AWS.IotData({
          endpoint: "a2983euzfbsfbz-ats.iot.us-west-2.amazonaws.com",
        });
      } catch (error) {
        console.log("Couldn't create iotData client error", error);
        return res
          .status(500)
          .json({ message: "Couldn't create iotData client error" });
      }

      var eventsPubsubParams = {
        topic: "myRequest-events-" + stage,
        payload: JSON.stringify({ data: "Poll events Please" }),
        qos: 0,
      };

      if (debug)
        console.log("created myRequest-events params", eventsPubsubParams);

      iotdata.publish(eventsPubsubParams, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          return res.status(500).json({
            message: "Not able to publish to IOT after updating event",
          });
        } else {
          let eventPubSubTopicName = "myRequest-event-" + eventId + "-" + stage;
          var eventPubsubParams = {
            topic: eventPubSubTopicName,
            payload: JSON.stringify({ data: "Poll events Please" }),
            qos: 0,
          };
          if (debug)
            console.log("created myRequest-event-" + eventId + " params");
          iotdata.publish(eventPubsubParams, function (err, data) {
            if (err) {
              console.log(err, err.stack);
              return res.status(500).json({
                message: "Not able to publish to IOT after updating event",
              });
            } else {
              const response = {
                statusCode: 200,
                body: params.Item,
              };
              if (debug) console.log("Response:\n", response);
              res.json({
                success: "UPDATE for record on events table succeeded!",
                record: response.body,
              });
            }
          });
        }
      });
    }
  });
});

/****************************
 * DELETE method *
 ****************************/

app.delete("/events/:id", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");

  if (debug) console.log("DELETE event request\n", req);

  const eventId = req.params.id;

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: eventId,
    },
  };
  if (debug) console.log("Params:\n", params);

  dynamoDb.delete(params, function (err, result) {
    if (err) {
      console.error(
        "Unable to DELETE item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      return res
        .status(500)
        .json({ message: "Couldn't delete event from table" });
    } else {
      // Publish AWS IOT for frontend clients to go get these db changes
      try {
        var iotdata = new AWS.IotData({
          endpoint: "a2983euzfbsfbz-ats.iot.us-west-2.amazonaws.com",
        });
      } catch (error) {
        console.log("Couldn't create iotData client error", error);
        return res
          .status(500)
          .json({ message: "Couldn't create iotData client error" });
      }

      var paramsIOT = {
        topic: "myRequest-events-" + stage,
        payload: JSON.stringify({ data: "Poll events Please" }),
        qos: 0,
      };

      if (debug) console.log("created IOT params", paramsIOT);

      iotdata.publish(paramsIOT, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          return res.status(500).json({
            message: "Not able to publish to IOT after updating event",
          });
        } else {
          const response = {
            statusCode: 200,
            body: req.body,
          };
          if (debug) console.log("Response:\n", response);

          res.json({
            success: "Delete call for events table succeeded!",
            response: response,
          });
        }
      });
    }
  });
});

/**********************
 *  Listen for requests
 **********************/
app.listen(3000, function () {
  console.log("My Request API...");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
