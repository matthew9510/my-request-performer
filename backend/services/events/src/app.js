'use strict';

/**********************
 *  Import Libraries
 **********************/
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const cors = require('cors');

//  Load AWS SDK for JavaScript to interact with AWS DynamoDB
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// declare a new express app
const app = express();

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
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE,PUT");
  next()
});
// Enable CORS Pre-Flight
app.options('*', cors()); // include before other routes


/**********************
 * GET all method *
 **********************/
app.get('/events', function (req, res) {

  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true")

  if (debug) console.log("GET all events request:\n", req);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    IndexName: 'id-date-index',
  };
  if (debug) console.log('Params:\n', params);

  // fetch event from the database
  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find items. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      // create a response
      const response = {
        statusCode: 200,
        body: result,
      };
      if (debug) console.log("Response:\n", response);

      res.json({
        success: 'Successfully found records from the events table!',
        response: response
      })
    }
  });
});

/**********************
 * GET by id method *
 **********************/
app.get('/events/:id', function (req, res) {

  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true")
  const eventId = req.params.id;

  if (debug) console.log("GET events by id request:\n", req);
  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: eventId
    },
  };
  if (debug) console.log('Params:\n', params);

  // fetch event from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      if (debug) console.log('Result:\n', result)
      if ("Item" in result && "id" in result.Item) {
        // create a response
        const response = {
          statusCode: 200,
          body: result,
        };
        if (debug) console.log("Response:\n", response)

        res.json({
          success: 'Successfully found record with id: ' + eventId + ' in the events table!',
          response: response
        })
      } else {
        if (debug) console.log("result of an non existent event", result) // response will be empty
        res.json({
          message: 'Unable to find record, please check event id ' + eventId + ' was entered correctly... ',
          invalid_id: eventId
        })
      }
    }
  })
});



/**********************
 * GET requests by event id possibly with a specific pending status
 **********************/
app.get('/events/:id/requests', function (req, res, next) {

  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true")
  const eventId = req.params.id;
  const requestStatus = req.query.status;
  let params;

  if (debug) console.log("GET: /events/:id/requests request object", req)

  // Set up query //
  if (requestStatus) {
    if (debug) console.log("EventId:", eventId)
    if (debug) console.log("Status:", requestStatus)

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: 'eventId-status-index',
      KeyConditionExpression: "eventId = :eventId and #status = :requestStatus",
      ExpressionAttributeValues: {
        ":eventId": eventId,
        ":requestStatus": requestStatus
      },
      ExpressionAttributeNames: {
        "#status": "status"
      }
    };
  } else {
    if (debug) console.log("EventId:", eventId)

    // create params
    params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      IndexName: 'eventId-id-index',
      KeyConditionExpression: "eventId = :eventId",
      ExpressionAttributeValues: {
        ":eventId": eventId
      },
    };
  }

  // Print constructed params //
  if (debug) console.log('Params:\n', params);

  // Todo //
  // Question - Can I hit an endpoint defined in this file? Or should I just use another query by using a query
  // Make Query //
  // Does the event even exist? //
  // psuedo-logic
  //  hit event/:id
  //    in subscribe check the response
  //      if an event exists what are the parameters
  //      if an event doesn't exist what are the parameters 
  //        if an event doesn't exist (response should be an empty object - format response) then throw an error to the console and to the next function or just send back a response with status 200 but body saying don't exist
  //        else, if an event exists then continue on with querying the event's requests


  // fetch requests from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential Dynamo db server errors
    if (error) {
      console.error("Unable to find item(s). Error JSON:", JSON.stringify(error, null, 2));
      next("error in events/:id/requests", error)
    } else {
      // Print the result
      if (debug) console.log('Result:\n', result)

      // First up response of now-playing being empty for an event
      const response = {
        statusCode: 200,
        body: result.Items,
      };

      if (response.body.length >= 1) {
        if (requestStatus) {
          res.json({
            success: "Found all " + requestStatus + " requests for event id: " + eventId,
            response: response
          })
        } else {
          res.json({
            success: 'Found all requests for event id: ' + eventId,
            response: response
          })
        }
      } else {
        if (requestStatus) {
          res.json({
            success: "Found no " + requestStatus + " requests for event id: " + eventId,
            response: response
          })
        } else {
          res.json({
            success: 'Found no requests for event id: ' + eventId,
            response: response
          })
        }
      }
    }
  });
})

/****************************
 * PUT method *
 ****************************/

app.post('/events', function (req, res) {

  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true")

  if (debug) console.log("POST events request:\n", req);

  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: req.body
  };
  if (debug) console.log('Params:\n', params);

  // Generate uuid & date record
  params.Item.id = uuid.v1();
  params.Item.createdOn = new Date().toJSON();

  // Note if table item is being inserted for the first time, the result will be empty
  dynamoDb.put(params, function (err, result) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: params.Item,
      };
      if (debug) console.log('Response:\n', response);

      res.json({
        success: 'Successfully added item to the events table!',
        record: response.body
      })
    }
  });
});


/****************************
 * PATCH method *
 ****************************/
// requires the body to be the item to update
app.put('/events/:id', function (req, res) {

  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true")

  if (debug) console.log("UPDATE event request...", req);

  const eventId = req.params.id

  // update item with modified date 
  let item = req.body
  item.modifiedOn = new Date().toJSON();

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: item
  };
  if (debug) console.log('Params:\n', params);

  // Note if table item is being updated then the result will be the new item
  dynamoDb.put(params, function (err, result) {
    if (debug) console.log("Result:", result)
    if (err) {
      console.error("Unable to Update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: params.Item,
      };
      if (debug) console.log('Response:\n', response);

      res.json({
        success: 'UPDATE for record on events table succeeded!',
        response: response.body
      });
    }
  });
});

/****************************
 * DELETE method *
 ****************************/

app.delete('/events/:id', function (req, res) {

  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true")

  if (debug) console.log("DELETE event request\n", req);

  const eventId = req.params.id

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: eventId,
    },
  };
  if (debug) console.log('Params:\n', params);

  dynamoDb.delete(params, function (err, result) {
    if (err) {
      console.error("Unable to DELETE item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: req.body,
      };
      if (debug) console.log('Response:\n', response);

      res.json({
        success: 'Delete call for events table succeeded!',
        response: response
      });
    }
  });
});


/**********************
 *  Listen for requests
 **********************/
app.listen(3000, function () {
  console.log("My Request API...")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
