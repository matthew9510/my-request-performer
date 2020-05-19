# Service Queue API

[Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/queue/stage/dev/region/us-west-2
)

service: queue

stage: dev

region: us-west-2

stack: my-request-queue-stack

Endpoints:

    ANY - https://u8pn7ho2md.execute-api.us-west-2.amazonaws.com/dev/queue
    
# Endpoint Test Using Postman

We'll be using Postman to populate our new table with test data using a PUT request.

##### Postman Configuration:
- Endpoint: https://u8pn7ho2md.execute-api.us-west-2.amazonaws.com/dev/queue
- Authorization: no auth

##### Populate with sample data
- From the body tab select 'raw' of type JSON
- Provide Payload

    {
          "artist": "Outkast",
          "song": "Roses",
          "memo": "Birthday!!!",
          "type": "Not Sure on value",
          "status": "pending",
          "event_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
          "requester_id": "Not Sure on value",
          "original_request_id": "Not Sure on value",
          "amount": 3.50
    }

Successful PUT Response:

    {
        "key": "value",
        "key": "value",
        "key": "value",
        "key": "value",
        "key": "valuef",
        "key": "value",
        "key": "value",
        "key": "value"
    }
    

##### Check record with GET Request:
- From the body tab select 'none'
- Currently ALL GET requests require a id
- From the params tab provide the following key & value
    - Key: id
    - Value: TEMPLATE

Successful GET Request

    {
        "key": "value",
        "key": "value",
        "key": "value",
        "key": "value",
        "key": "valuef",
        "key": "value",
        "key": "value",
        "key": "value"
    }
    
