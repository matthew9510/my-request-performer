"use strict";

/**********************
 *  Import Libraries
 **********************/
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const cors = require("cors");
const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider({ region: "us-west-2" });

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

/****************************
 * DELETE Cognito user method *
 ****************************/

app.delete("/authentication/deleteCognitoAccount/:id", function (req, res) {
  // If debug flag passed show console logs
  const debug = Boolean(req.query.debug == "true");

  if (debug) console.log("DELETE Cognito User\n", req);

  const accountSub = req.params.id;

  let params;
  if (process.env.STAGE === "prod") {
    params = {
      UserPoolId: process.env.PROD_USERPOOL_ID,
      Username: accountSub,
    };
  } else {
    params = {
      UserPoolId: process.env.DEV_USERPOOL_ID,
      Username: accountSub,
    };
  }

  cognito.adminDeleteUser(params, (err, data) => {
    if (err) {
      console.error("Error deleting cognito user:", err);
      res.status(400).json({
        err,
      });
    } else {
      if (debug) console.log(data);
      res.status(200).json({
        cognitoData: data,
        message: "Cognito account deleted successfully.",
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
