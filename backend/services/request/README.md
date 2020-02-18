# Request API

Service: my-request-request-api

Stage: dev

Region: us-west-2

Stack: my-request-request-api

Resources: 46

Api keys: None

Layers: None

Serverless: Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/my-request-request-api/stage/dev/region/us-west-2)

Endpoints:

    POST - https://zfp3v9kdn7.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://zfp3v9kdn7.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://zfp3v9kdn7.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    PUT - https://zfp3v9kdn7.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    DELETE - https://zfp3v9kdn7.execute-api.us-west-2.amazonaws.com/dev/src/{id}
  
Functions:

    create: my-request-request-api-dev-create
    list: my-request-request-api-dev-list
    get: my-request-request-api-dev-get
    update: my-request-request-api-dev-update
    delete: my-request-request-api-dev-delete
 
Sample CURL command:

    curl https://zfp3v9kdn7.execute-api.us-west-2.amazonaws.com/dev/src
    
Sample Request Response:

    {
        "artist":"Outkast",
        "song":"Roses",
        "original_request_id":"Not Sure on value",
        "status":"pending",
        "event_id":"705346f8-c9da-4dc4-b0b8-6898595dcaaf",
        "memo":"Birthday",
        "requester_id":"8ef9e7c9-8bfb-45ed-938b-152a7910b45c",
        "id":"32089884-6854-4b63-9e57-5f94b5e246cf","type":"Not Sure on value"
    }
