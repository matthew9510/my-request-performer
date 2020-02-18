# Transaction API

Service: my-request-transaction-api

Stage: dev

Region: us-west-2

Stack: my-request-transaction-api

Resources: 46

Api keys: None

Layers: None

Serverless: Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/my-request-transaction-api/stage/dev/region/us-west-2)

Endpoints:

    POST - https://ssfafaxdnc.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://ssfafaxdnc.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://ssfafaxdnc.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    PUT - https://ssfafaxdnc.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    DELETE - https://ssfafaxdnc.execute-api.us-west-2.amazonaws.com/dev/src/{id}
  
Functions:

    create: my-request-transaction-api-dev-create
    list: my-request-transaction-api-dev-list
    get: my-request-transaction-api-dev-get
    update: my-request-transaction-api-dev-update
    delete: my-request-transaction-api-dev-delete
 
Sample CURL command:

    curl https://ssfafaxdnc.execute-api.us-west-2.amazonaws.com/dev/src
    
Sample Venues Response:

    {
        "performer_id":"82825bc1-58de-4d18-965c-b2d6b5a85da3",
        "stripe_payment_intent_id":"Not sure on value",
        "request_id":"8ef9e7c9-8bfb-45ed-938b-152a7910b45c",
        "status":"pending",
        "amount":"$5",
        "event_id":"705346f8-c9da-4dc4-b0b8-6898595dcaaf",
        "requester_id":"32089884-6854-4b63-9e57-5f94b5e246cf",
        "id":"c20b3eeb-f67e-4c17-b0a0-4d21d429b04d",
        "type":"Not sure on value"
    }
