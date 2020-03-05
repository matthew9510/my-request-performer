# Service Transactions API

[Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/transactions/stage/dev/region/us-west-2)

service: transactions

stage: dev

region: us-west-2

stack: my-request-transactions-stack

Endpoints:

    ANY - https://hndjafk1sl.execute-api.us-west-2.amazonaws.com/dev/transactions
    
# Endpoint Test Using Postman

We'll be using Postman to populate our new table with test data using a PUT request.

##### Postman Configuration:
- Endpoint: https://hndjafk1sl.execute-api.us-west-2.amazonaws.com/dev/transactions
- Authorization: no auth

##### Populate with sample data
- From the body tab select 'raw' of type JSON
- Provide Payload

        {
            "amount": 5.50,
            "type": "Not Sure on value",
            "status": "pending",
            "stripe_payment_intent_id": "Not Sure on value",
            "event_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
            "performer_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
            "requester_id": "Not Sure on value",
            "original_request_id": "Not Sure on value"
        }

Successful PUT Response:

    {
        "success": "Successfully added item to the transactions table!",
        "record": {
            "amount": 5.5,
            "type": "Not Sure on value",
            "status": "pending",
            "stripe_payment_intent_id": "Not Sure on value",
            "event_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
            "performer_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
            "requester_id": "Not Sure on value",
            "original_request_id": "Not Sure on value",
            "id": "b420a910-5616-11ea-8d5e-012fda3c893e",
            "date_created": "2020-02-23"
        }
    }
    

##### Check record with GET Request:
- From the body tab select 'none'
- Currently ALL GET requests require a id
- From the params tab provide the following key & value
    - Key: id
    - Value: b420a910-5616-11ea-8d5e-012fda3c893e

Successful GET Request

    {
        "success": "Successfully found item in the transactions table!",
        "response": {
            "performer_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
            "stripe_payment_intent_id": "Not Sure on value",
            "original_request_id": "Not Sure on value",
            "status": "pending",
            "amount": 5.5,
            "event_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
            "requester_id": "Not Sure on value",
            "date_created": "2020-02-23",
            "id": "b420a910-5616-11ea-8d5e-012fda3c893e",
            "type": "Not Sure on value"
        }
    }
    
