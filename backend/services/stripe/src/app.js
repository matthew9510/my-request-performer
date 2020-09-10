"use strict";

/**********************
 *  Import Libraries
 **********************/
const uuid = require("uuid");
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const cors = require("cors");
const AWS = require("aws-sdk"); // for secret key

// Declare a new dynamo db client
const dynamoDb = require("./dynamodb");

// declare a new express app
const app = express();

/**********************
 *   Middleware
 **********************/
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// setup for loading stripe lib
let stage;
let stageConfigs;
let ssmKey;

// declare stripe lib reference, will be loaded in below async function
let stripe;

app.use(function (req, res, next) {
  stage = process.env.STAGE;
  stageConfigs = {
    dev: {
      stripeKeyName: "/stripeSecretKey/test",
    },
    prod: {
      stripeKeyName: "/stripeSecretKey/live",
    },
  };

  ssmKey = stageConfigs[stage] || stageConfigs.dev;

  async function loadStripe() {
    // Load our secret key from SSM
    const ssm = new AWS.SSM();

    const stripeSecretKey = await ssm
      .getParameter({
        Name: ssmKey.stripeKeyName,
        WithDecryption: true,
      })
      .promise();

    // load stripe library
    stripe = require("stripe")(stripeSecretKey.Parameter.Value, {
      apiVersion: "",
    });
    next();
  }

  try {
    loadStripe();
  } catch (e) {
    console.log(e);
  }
});

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
  const debug = Boolean(req.query.debug == "true");
  let performerId = req.query.id;

  // If debug flag passed show console logs
  if (debug) {
    console.log("GET stripe connect oath state for performer request:\n", req);
  }

  // create parameters for dynamo db
  const params = {
    TableName: process.env.DYNAMODB_PERFORMERS_TABLE,
    Key: {
      id: performerId,
    },
    ExpressionAttributeNames: {
      "#state": "state",
    },
    ExpressionAttributeValues: {
      ":modifiedOn": new Date().toJSON(),
      ":state": Math.random().toString(36).slice(2),
    },
    UpdateExpression: "set modifiedOn = :modifiedOn, #state = :state",
    ReturnValues: "ALL_NEW",
  };
  if (debug) console.log("Params:\n", params);

  // Note if table item is being updated then the result will be the new item
  dynamoDb.update(params, function (err, result) {
    if (debug) console.log("Result:", result);
    if (err) {
      console.error(
        "Unable to Update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      const response = {
        statusCode: 200,
        performer: result.Attributes,
        message: "UPDATE for record on performer table succeeded!",
      };
      if (debug) console.log("Response:\n", response);

      res.json(response);
    }
  });
});

// Link the performer's standard account and the My Request platform account
app.get("/stripe/connect/linkStandardAccount", function (req, res, next) {
  // load request query params in to local scope
  const {
    stripeState,
    stripeAuthCode,
    performerId,
    performerState,
  } = req.query;
  const debug = req.query.debug === "true";

  // load performer state from db rather than client?

  // Assert the state matches the state you provided in the OAuth link (optional).
  if (stripeState !== performerState) {
    return res
      .status(403)
      .json({ error: "Incorrect state parameter: " + state });
  }

  // Send the authorization code to Stripe's API.
  stripe.oauth
    .token({
      grant_type: "authorization_code",
      code: stripeAuthCode,
    })
    .then(
      (response) => {
        var connected_account_id = response.stripe_user_id;

        // If successful we should maybe remove the state property as well
        // Save Stripe connected account id to performer entry in dynamodb
        const params = {
          TableName: process.env.DYNAMODB_PERFORMERS_TABLE,
          Key: {
            id: performerId,
          },
          ExpressionAttributeNames: {
            "#state": "state",
          },
          ExpressionAttributeValues: {
            ":modifiedOn": new Date().toJSON(),
            ":stripeId": connected_account_id,
          },
          UpdateExpression:
            "set modifiedOn = :modifiedOn, stripeId = :stripeId remove #state",
          ReturnValues: "ALL_NEW",
        };
        if (debug) console.log("Params for db update:\n", params);

        // Note if table item is being updated then the result will be the new item
        dynamoDb.update(params, function (err, result) {
          if (debug) console.log(" in update subscribe Result:", result);
          if (err) {
            console.error(
              "Unable to Update item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
            const response = {
              statusCode: 200,
              performer: result.Attributes,
              message: "UPDATE for record on performer table succeeded!",
            };
            if (debug) console.log("preparation of Response:\n", response);

            res.json(response);
          }
        });
      },
      (err) => {
        if (debug) console.log("in error of stripe.token catch", err);
        if (err.type === "StripeInvalidGrantError") {
          return res
            .status(400)
            .json({ error: "Invalid authorization code: " + code });
        } else {
          return res.status(500).json({ error: "An unknown error occurred." });
        }
      }
    );
});

// this function deals with errors for the /stripe/createPaymentIntent and
// /stripe/updatePaymentIntentWithNewPaymentMethod routes below
function handlePaymentIntentMethodErrors(error, res) {
  if (error.type === "StripeCardError") {
    let paymentRequiredErrorStatusCode = 402;
    let invalidCardDetailsErrorMessage =
      "One or more of the following fields are incorrect, Card Number, CVC, or ZipCode.";
    let cardDeclinedErrorMessage =
      "The card was declined, please try with a different payment method.";
    let expiredCardErrorMessage =
      "The card is expired, please try with a different payment method.";
    let stripeProcessingErrorMessage =
      "An error occurred while processing the card. Try again later or with a different payment method.";
    let genericErrorMessage =
      "Please review card info, or try with a different payment method.";

    const possibleErrors = {
      invalid_cvc: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: invalidCardDetailsErrorMessage,
      },
      invalid_expiry_month: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: invalidCardDetailsErrorMessage,
      },
      invalid_expiry_year: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: invalidCardDetailsErrorMessage,
      },
      invalid_number: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: invalidCardDetailsErrorMessage,
      },
      incorrect_cvc: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: invalidCardDetailsErrorMessage,
      },
      incorrect_number: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: invalidCardDetailsErrorMessage,
      },
      incorrect_zip: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: invalidCardDetailsErrorMessage,
      },
      card_declined: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: cardDeclinedErrorMessage,
      },
      expired_card: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: expiredCardErrorMessage,
      },
      processing_error: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: stripeProcessingErrorMessage,
      },
      generic: {
        statusCode: paymentRequiredErrorStatusCode,
        errorMessage: genericErrorMessage,
      },
    };

    let errorHandlerObject;
    if (error.raw.code in possibleErrors) {
      errorHandlerObject = possibleErrors[error.raw.code];
    } else {
      // generic case
      errorHandlerObject = possibleErrors.generic;
    }

    res.status(errorHandlerObject.statusCode).json({
      errorType: error.type,
      errorCode: error.raw.code,
      errorMessage: errorHandlerObject.errorMessage,
      originalPaymentIntentId: error.raw.payment_intent.id,
    });
  } else {
    let errorMessage =
      "Stripe couldn't create a payment intent or create a database entry";
    console.error(errorMessage, JSON.stringify(error, null, 2));
    res.json({
      message: errorMessage,
      statusCode: 400,
    });
  }
}

// Initialization of a payment intent
app.post("/stripe/createPaymentIntent", async function (req, res, next) {
  const debug = req.query.debug === "true";
  const {
    song,
    artist,
    amount,
    memo,
    eventId,
    performerId,
    performerStripeId,
    status,
    requesterId,
    firstName,
    lastName,
    originalRequestId,
  } = req.body;

  // Validate amount
  if (req.body.amount < 0) {
    const response = {
      statusCode: 400,
      body: "Amount cannot be less than 0.",
    };
    console.error(response);
    return res.json(response);
  }

  try {
    // Get amount in stripe desired form
    const convertedPaymentIntentAmount = Math.floor(amount * 100);

    // create a payment intent for this request
    const paymentIntent = await stripe.paymentIntents.create(
      {
        payment_method_data: {
          type: "card",
          "card[token]": req.body.token.id,
        },
        amount: convertedPaymentIntentAmount,
        // application_fee_amount: 0,
        currency: "usd",
        // confirmation_method set to manual states that this payment intent
        // can't be captured without the stripe secret key
        confirmation_method: "manual",
        // capture_method set to manual states to place a hold on the funds
        // when the customer authorizes the payment, but don’t capture the
        // funds until later. This also will throw an error if there is a
        // problem with authorizing the payment method
        capture_method: "manual",
        // confirm set to true will attempt to confirm this PaymentIntent
        // immediately, this is also needed to throw an error if there is
        // a problem with authorizing the payment method
        confirm: true,
      },
      {
        // this states to do this on behalf of the performer's account
        stripeAccount: performerStripeId,
      }
    );

    if (debug) console.log("payment Intent object", paymentIntent);

    // setup the database entry
    let requestsDbEntry = {
      song,
      artist,
      amount,
      memo,
      eventId,
      performerId,
      performerStripeId,
      status,
      requesterId,
      firstName,
      lastName,
      paymentIntentId: paymentIntent.id,
      paymentIntentClientSecret: paymentIntent.client_secret,
    };

    // Convert any empty strings to null for dynamoDB
    requestsDbEntry.firstName =
      requestsDbEntry.firstName === "" ? null : requestsDbEntry.firstName;
    requestsDbEntry.lastName =
      requestsDbEntry.lastName === "" ? null : requestsDbEntry.lastName;
    requestsDbEntry.memo =
      requestsDbEntry.memo === "" ? null : requestsDbEntry.memo;

    // Generate uuid & date for the record
    let currentDate = new Date().toJSON();
    requestsDbEntry.id = uuid.v1();
    requestsDbEntry.createdOn = currentDate;
    requestsDbEntry.modifiedOn = currentDate;

    // Handle linking top-ups with original requests
    if (originalRequestId === undefined) {
      // Needed for top-up implementation of frontend app
      requestsDbEntry.originalRequestId = requestsDbEntry.id;
    } else {
      requestsDbEntry.originalRequestId = originalRequestId;
    }

    // setup the dynamoDb config
    let params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      Item: requestsDbEntry,
    };

    // print the params if the debug flag is set
    if (debug) console.log("Params:\n", params);

    // Save this request entry to the table
    dynamoDb.put(params, (error, result) => {
      if (error) {
        console.log("db error", error);
        console.error(
          "Unable store paid request item. Error JSON:",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error);
      } else {
        if (debug) {
          console.log("request db entry", requestsDbEntry);
          console.log("paymentIntent", paymentIntent);
        }

        // send back successful response
        return res.json({
          message: "Successfully added item to the stripe table!",
          result: requestsDbEntry,
          statusCode: 200,
        });
      }
    });
  } catch (error) {
    if (debug) console.error("Error that comes back: ", error);
    handlePaymentIntentMethodErrors(error, res);
  }
});

// Initialization of a payment intent
app.post("/stripe/updatePaymentIntentWithNewPaymentMethod", async function (
  req,
  res,
  next
) {
  const debug = req.query.debug === "true";
  const {
    song,
    artist,
    amount,
    memo,
    eventId,
    performerId,
    performerStripeId,
    status,
    requesterId,
    firstName,
    lastName,
    originalRequestId,
    originalPaymentIntentId,
  } = req.body;

  try {
    // update original payment intent
    const updatedPaymentIntent = await stripe.paymentIntents.update(
      originalPaymentIntentId,
      {
        payment_method_data: {
          type: "card",
          "card[token]": req.body.token.id,
        },
      },
      {
        // this states to do this on behalf of the performer's account
        stripeAccount: performerStripeId,
      }
    );

    if (debug) console.log("Updated payment intent", updatedPaymentIntent);

    // confirm payment intent, this is done to place transaction funds on hold
    // and to make sure the payment method is valid, if there are issues
    // with the payment method an error will be thrown
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      updatedPaymentIntent.id,
      {
        // this states to do this on behalf of the performer's account
        stripeAccount: performerStripeId,
      }
    );
    if (debug) console.log("Confirmed payment intent", confirmedPaymentIntent);

    // setup the database entry
    let requestsDbEntry = {
      song,
      artist,
      amount,
      memo,
      eventId,
      performerId,
      performerStripeId,
      status,
      requesterId,
      firstName,
      lastName,
      paymentIntentId: confirmedPaymentIntent.id,
      paymentIntentClientSecret: confirmedPaymentIntent.client_secret,
    };

    // Convert any empty strings to null for dynamoDB
    requestsDbEntry.firstName =
      requestsDbEntry.firstName === "" ? null : requestsDbEntry.firstName;
    requestsDbEntry.lastName =
      requestsDbEntry.lastName === "" ? null : requestsDbEntry.lastName;
    requestsDbEntry.memo =
      requestsDbEntry.memo === "" ? null : requestsDbEntry.memo;

    // Generate uuid & date for the record
    let currentDate = new Date().toJSON();
    requestsDbEntry.id = uuid.v1();
    requestsDbEntry.createdOn = currentDate;
    requestsDbEntry.modifiedOn = currentDate;

    // Handle linking top-ups with original requests
    if (originalRequestId === undefined) {
      // Needed for top-up implementation of frontend app
      requestsDbEntry.originalRequestId = requestsDbEntry.id;
    } else {
      requestsDbEntry.originalRequestId = originalRequestId;
    }

    // setup the dynamoDb config
    let params = {
      TableName: process.env.DYNAMODB_REQUESTS_TABLE,
      Item: requestsDbEntry,
    };

    // print the params if the debug flag is set
    if (debug) console.log("Params:\n", params);

    // Save this request entry to the table
    dynamoDb.put(params, (error, result) => {
      if (error) {
        console.log("db error", error);
        console.error(
          "Unable store paid request item. Error JSON:",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error);
      } else {
        if (debug) {
          console.log("request db entry", requestsDbEntry);
          console.log(
            "updated confirmed paymentIntent",
            confirmedPaymentIntent
          );
        }

        // send back successful response
        return res.json({
          message: "Successfully added item to the stripe table!",
          result: requestsDbEntry,
          statusCode: 200,
        });
      }
    });
  } catch (error) {
    if (debug) console.error("Error that comes back: ", error);
    handlePaymentIntentMethodErrors(error, res);
  }
});

// Capturing of a payment intent
app.post("/stripe/capturePaymentIntent", async function (req, res, next) {
  const debug = req.query.debug === "true";
  const request = req.body;

  try {
    if (debug) console.log("before capture", request.paymentIntentId);

    const capturedPaymentIntent = await stripe.paymentIntents.capture(
      request.paymentIntentId,
      {
        stripeAccount: request.performerStripeId,
      }
    );
    if (debug) console.log("after capture");
    if (debug) console.log(capturedPaymentIntent);

    if (capturedPaymentIntent.status === "succeeded") {
      //update modified date
      request.modifiedOn = new Date().toJSON();

      // temporarily store the status of paymentIntent
      request.paymentIntentStatus = capturedPaymentIntent.status;

      if (debug) console.log(request.paymentIntentStatus);

      // create params
      const params = {
        TableName: process.env.DYNAMODB_REQUESTS_TABLE,
        Key: {
          id: request.id,
        },
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": request.status,
          ":modifiedOn": request.modifiedOn,
          ":paymentIntentStatus": request.paymentIntentStatus,
        },
        UpdateExpression:
          "set modifiedOn = :modifiedOn, paymentIntentStatus = :paymentIntentStatus, #status= :status",
        ReturnValues: "UPDATED_OLD",
      };
      if (debug) console.log("Params:\n", params);

      // Note if table item is being updated then the result will be the new item
      dynamoDb.update(params, function (error, result) {
        if (error) {
          console.log("db error", error);
          console.error(
            "Unable store paid request item. Error JSON:",
            JSON.stringify(error, null, 2)
          );
          throw new Error(error);
        } else {
          if (debug) {
            console.log("request db result form update", result);
            console.log("expected request db entry", request);
            console.log("capturedPaymentIntent", capturedPaymentIntent);
          }

          // send back successful response
          return res.json({
            message: "Successfully added item to the stripe table!",
            result: request,
            statusCode: 200,
          });
        }
      });
    }
  } catch (error) {
    let errorMessage =
      "Stripe couldn't capture a payment intent or create a database entry";
    console.error(error, JSON.stringify(error, null, 2));
    res.json({
      message: error,
      statusCode: 400,
    });
  }
});

// Capturing of a payment intent
app.patch("/stripe/cancelPaymentIntent/:requestId", async function (
  req,
  res,
  next
) {
  const debug = req.query.debug === "true";
  const requestId = req.params.requestId;
  const { paymentIntentId, status, performerStripeId } = req.body;

  try {
    const cancelledPaymentIntent = await stripe.paymentIntents.cancel(
      paymentIntentId,
      {
        stripeAccount: performerStripeId,
      }
    );
    if (debug) console.log("after capture", cancelledPaymentIntent);

    if (cancelledPaymentIntent.status === "canceled") {
      //update modified date
      let modifiedOn = new Date().toJSON();

      // create params
      const params = {
        TableName: process.env.DYNAMODB_REQUESTS_TABLE,
        Key: {
          id: requestId,
        },
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":modifiedOn": modifiedOn,
          ":paymentIntentStatus": cancelledPaymentIntent.status,
        },
        UpdateExpression:
          "set modifiedOn = :modifiedOn, paymentIntentStatus = :paymentIntentStatus, #status= :status",
        ReturnValues: "UPDATED_OLD",
      };
      if (debug) console.log("Params:\n", params);

      // Note if table item is being updated then the result will be the new item
      dynamoDb.update(params, function (error, result) {
        if (error) {
          console.log("db error", error);
          console.error(
            "Unable store canceled request item. Error JSON:",
            JSON.stringify(error, null, 2)
          );
          throw new Error(error);
        } else {
          if (debug) {
            console.log("request db result form update", result);
            console.log("cancelledPaymentIntent", cancelledPaymentIntent);
          }

          // send back successful response
          return res.json({
            message: "Successfully added item to the stripe table!",
            result: result,
            statusCode: 200,
          });
        }
      });
    }
  } catch (error) {
    let errorMessage =
      "Stripe couldn't capture a payment intent or create a database entry";
    console.error(error, JSON.stringify(error, null, 2));
    res.json({
      message: error,
      statusCode: 400,
    });
  }
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
