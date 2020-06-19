"use strict";

/**********************
 *  Import Libraries
 **********************/
const uuid = require("uuid");
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const cors = require("cors");
const stripe = require("stripe");

//  Load AWS SDK for JavaScr'ipt to interact with AWS DynamoDB
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
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE,PUT");
  next();
});
// Enable CORS Pre-Flight
app.options("*", cors()); // include before other routes

// Create a unique state for preventing csrf attacks
app.get("/stripe/connect/oath/state", function (req, res, next) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");
  let performer = req.body; // might have to use JSON.parse

  if (debug)
    console.log("GET stripe connect oath state for performer request:\n", req);

  // Generate state
  performer.state = Math.random().toString(36).slice(2);

  // create params
  const params = {
    TableName: process.env.DYNAMODB_PERFORMERS_TABLE,
    Key: {
      id: performer.performerId,
    },
  };
  if (debug) console.log("Params:\n", params);

  let response = {
    record: {
      state: performer.state,
    },
  };

  res.json({
    success: "Successfully added state to performer db entry",
    response: response,
  });

  // save the state to the performers table entry;
  // in subscribe send it back
});

// app.post("/connect/oath", function (req, res, next) {
//   const { code, state } = req.query;

//   // get state from db

//   // Assert the state matches the state you provided in the OAuth link (optional).
//   if (!stateMatches(state)) {
//     return res
//       .status(403)
//       .json({ error: "Incorrect state parameter: " + state });
//   }

//   // Send the authorization code to Stripe's API.
//   stripe.oauth
//     .token({
//       grant_type: "authorization_code",
//       code,
//     })
//     .then(
//       (response) => {
//         var connected_account_id = response.stripe_user_id;
//         saveAccountId(connected_account_id);

//         // Render some HTML or redirect to a different page.
//         return res.status(200).json({ success: true });
//       },
//       (err) => {
//         if (err.type === "StripeInvalidGrantError") {
//           return res
//             .status(400)
//             .json({ error: "Invalid authorization code: " + code });
//         } else {
//           return res.status(500).json({ error: "An unknown error occurred." });
//         }
//       }
//     );
// });

// const stateMatches = (state_parameter) => {
//   // Load the same state value that you randomly generated for your OAuth link.
//   const saved_state = "sv_53124";

//   return saved_state == state_parameter;
// };

// const saveAccountId = (id) => {
//   // Save the connected account ID from the response to your database.
//   console.log("Connected account ID: " + id);
// };

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
