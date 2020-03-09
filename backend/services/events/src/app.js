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
  console.log("GET all events request:\n", req);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };
  console.log('Params:\n', params);

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
      console.log("Response:\n", response);

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
  console.log("GET events by id request:\n", req);

  const eventId = req.params.id;

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: eventId
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
          success: 'Successfully found record with id: ' + eventId + ' in the events table!',
          response: response
        })
      } else {
        res.json({
          message: 'Unable to find record, please check event id ' + eventId + ' was entered correctly... ',
          invalid_id: eventId
        })
      }
    }
  })
});


/**********************
 * GET requests by event id method 
 **********************/
app.get('/events/:id/requests', function (req, res) {
  console.log("GET requests by event id request:\n", req);

  const eventId = req.params.id

  // create params
  const params = {
    TableName: process.env.DYNAMODB_REQUESTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: 'event_id-id-index',
    KeyConditionExpression: "event_id = :event_id", // Am I allowed to query like this, without primary keys? // Is event id
    ExpressionAttributeValues: {
      ":event_id": eventId
    },
  };
  console.log('Params:\n', params);

  // fetch request from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log('Result:\n', result)
      if ("Items" in result && result.Items.length > 0) {
        const response = {
          statusCode: 200,
          body: result.Items,
        };
        console.log("Response:\n", response)

        res.json({
          success: 'Found all requests for event id:' + eventId,
          response: response
        })
      } else {
        res.json({
          message: 'Unable to find record, please check event id ' + eventId + ' was entered correctly... ',
          invalid_id: eventId
        })
      }
    }
  });
});

/**********************
 * GET requests by event id with pending status
 **********************/
app.get('/events/:id/requests/pending', function (req, res) {
  console.log("GET pending requests by event id request:\n", req);

  const eventId = req.params.id

  // create params
  const params = {
    TableName: process.env.DYNAMODB_REQUESTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: 'event_id-status-index',
    KeyConditionExpression: "event_id = :event_id and #status = :requestStatus",
    ExpressionAttributeValues: {
      ":event_id": eventId,
      ":requestStatus": 'pending'
    },
    ExpressionAttributeNames: {
      "#status": "status"
    },
  };
  console.log('Params:\n', params);

  // fetch requests with status pending from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log('Result:\n', result)
      if ("Items" in result && result.Items.length > 0) {
        const response = {
          statusCode: 200,
          body: result.Items,
        };
        console.log("Response:\n", response)

        res.json({
          success: 'Found all pending requests for event id:' + eventId,
          response: response
        })
      } else {
        res.json({
          message: 'Unable to find record, please check event id ' + eventId + ' was entered correctly... ',
          invalid_id: eventId
        })
      }
    }
  });
})

/**********************
 * GET requests by event id with accepted status
 **********************/
app.get('/events/:id/requests/accepted', function (req, res) {
  console.log("GET accepted requests by event id request:\n", req);

  const eventId = req.params.id

  // create params
  const params = {
    TableName: process.env.DYNAMODB_REQUESTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: 'event_id-status-index',
    KeyConditionExpression: "event_id = :event_id and #status = :requestStatus",
    ExpressionAttributeValues: {
      ":event_id": eventId,
      ":requestStatus": 'accepted'
    },
    ExpressionAttributeNames: {
      "#status": "status"
    },
  };
  console.log('Params:\n', params);

  // fetch requests with status pending from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log('Result:\n', result)
      if ("Items" in result && result.Items.length > 0) {
        const response = {
          statusCode: 200,
          body: result.Items,
        };
        console.log("Response:\n", response)

        res.json({
          success: 'Found all accepted requests for event id:' + eventId,
          response: response
        })
      } else {
        res.json({
          message: 'Unable to find record, please check event id ' + eventId + ' was entered correctly... ',
          invalid_id: eventId
        })
      }
    }
  });
})

/**********************
 * GET requests by event id with rejected status
 **********************/
app.get('/events/:id/requests/rejected', function (req, res) {
  console.log("GET rejected requests by event id request:\n", req);

  const eventId = req.params.id

  // create params
  const params = {
    TableName: process.env.DYNAMODB_REQUESTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: 'event_id-status-index',
    KeyConditionExpression: "event_id = :event_id and #status = :requestStatus",
    ExpressionAttributeValues: {
      ":event_id": eventId,
      ":requestStatus": 'rejected'
    },
    ExpressionAttributeNames: {
      "#status": "status"
    },
  };
  console.log('Params:\n', params);

  // fetch requests with status pending from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log('Result:\n', result)
      if ("Items" in result && result.Items.length > 0) {
        const response = {
          statusCode: 200,
          body: result.Items,
        };
        console.log("Response:\n", response)

        res.json({
          success: 'Found all rejected requests for event id:' + eventId,
          response: response
        })
      } else {
        res.json({
          message: 'Unable to find record, please check event id ' + eventId + ' was entered correctly... ',
          invalid_id: eventId
        })
      }
    }
  });
})

/**********************
 * GET requests by event id with now playing status
 **********************/
app.get('/events/:id/requests/now-playing', function (req, res) {
  console.log("GET now playing requests by event id request:\n", req);

  const eventId = req.params.id

  // create params
  const params = {
    TableName: process.env.DYNAMODB_REQUESTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: 'event_id-status-index',
    KeyConditionExpression: "event_id = :event_id and #status = :requestStatus",
    ExpressionAttributeValues: {
      ":event_id": eventId,
      ":requestStatus": 'now playing'
    },
    ExpressionAttributeNames: {
      "#status": "status"
    },
  };
  console.log('Params:\n', params);

  // fetch requests with status pending from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log('Result:\n', result)
      if ("Items" in result && result.Items.length > 0) {
        const response = {
          statusCode: 200,
          body: result.Items,
        };
        console.log("Response:\n", response)

        res.json({
          success: 'Found all now playing requests for event id:' + eventId,
          response: response
        })
      } else {
        res.json({
          message: 'Unable to find record, please check event id ' + eventId + ' was entered correctly... ',
          invalid_id: eventId
        })
      }
    }
  });
})

/**********************
 * GET requests by event id with complete status
 **********************/
app.get('/events/:id/requests/complete', function (req, res) {
  console.log("GET complete requests by event id request:\n", req);

  const eventId = req.params.id

  // create params
  const params = {
    TableName: process.env.DYNAMODB_REQUESTS_TABLE, //process.env.DYNAMODB_REQUESTS_TABLE, // DYNAMODB_REQUESTS_TABLE === my-request-requests-table
    IndexName: 'event_id-status-index',
    KeyConditionExpression: "event_id = :event_id and #status = :requestStatus",
    ExpressionAttributeValues: {
      ":event_id": eventId,
      ":requestStatus": 'complete'
    },
    ExpressionAttributeNames: {
      "#status": "status"
    },
  };
  console.log('Params:\n', params);

  // fetch requests with status pending from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error("Unable to find item. Error JSON:", JSON.stringify(error, null, 2));
    } else {
      console.log('Result:\n', result)
      if ("Items" in result && result.Items.length > 0) {
        const response = {
          statusCode: 200,
          body: result.Items,
        };
        console.log("Response:\n", response)

        res.json({
          success: 'Found all completed requests for event id:' + eventId,
          response: response
        })
      } else {
        res.json({
          message: 'Unable to find record, please check event id ' + eventId + ' was entered correctly... ',
          invalid_id: eventId
        })
      }
    }
  });
})


/****************************
 * PUT method *
 ****************************/

app.post('/events', function (req, res) {
  console.log("POST events request:\n", req);

  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: req.body
  };
  console.log('Params:\n', params);

  // Generate uuid & date record
  params.Item.id = uuid.v1();
  params.Item.date_created = new Date().toJSON().slice(0, 10);

  // Note if table item is being inserted for the first time, the result will be empty
  dynamoDb.put(params, function (err, result) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: params.Item,
      };
      console.log('Response:\n', response);

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
  console.log("UPDATE event request...", req);

  const eventId = req.params.id

  // update item with modified date 
  let item = req.body
  item.date_modified = new Date().toJSON().slice(0, 10);

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
  console.log("DELETE event request\n", req);

  const eventId = req.params.id

  // create params
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: eventId,
    },
  };
  console.log('Params:\n', params);

  dynamoDb.delete(params, function (err, result) {
    if (err) {
      console.error("Unable to DELETE item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      const response = {
        statusCode: 200,
        body: req.body,
      };
      console.log('Response:\n', response);

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
