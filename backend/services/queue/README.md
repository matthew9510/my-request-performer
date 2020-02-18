# Queue API

Service: my-request-queue-api

Stage: dev

Region: us-west-2

Stack: my-request-queue-api

Resources: 46

Api keys: None

Layers: None

Serverless: Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/my-request-queue-api/stage/dev/region/us-west-2)

Endpoints:

    POST - https://xw1or8q4x7.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://xw1or8q4x7.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://xw1or8q4x7.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    PUT - https://xw1or8q4x7.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    DELETE - https://xw1or8q4x7.execute-api.us-west-2.amazonaws.com/dev/src/{id}

Functions:

    create: my-request-queue-api-dev-create
    list: my-request-queue-api-dev-list
    get: my-request-queue-api-dev-get
    update: my-request-queue-api-dev-update
    delete: my-request-queue-api-dev-delete
 
Sample CURL command:

    curl https://xw1or8q4x7.execute-api.us-west-2.amazonaws.com/dev/src
    
Sample Queue Response:

    {
        "id":"8b825a3a-8e7a-4633-8581-08664c2ec4a0",
        "event_id":"705346f8-c9da-4dc4-b0b8-6898595dcaaf",
        "request_id":"8ef9e7c9-8bfb-45ed-938b-152a7910b45c"
    }
