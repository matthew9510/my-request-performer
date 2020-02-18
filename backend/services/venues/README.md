# Venues API

Service: my-request-venues-api

Stage: dev

Region: us-west-2

Stack: my-request-venues-api

Resources: 46

Api keys: None

Layers: None

Serverless: Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/my-request-venues-api/stage/dev/region/us-west-2)

Endpoints:

    POST - https://qrwq5aimw7.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://qrwq5aimw7.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://qrwq5aimw7.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    PUT - https://qrwq5aimw7.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    DELETE - https://qrwq5aimw7.execute-api.us-west-2.amazonaws.com/dev/src/{id}
  
Functions:

    create: my-request-venues-api-dev-create
    list: my-request-venues-api-dev-list
    get: my-request-venues-api-dev-get
    update: my-request-venues-api-dev-update
    delete: my-request-venues-api-dev-delete
 
Sample CURL command:

    curl https://qrwq5aimw7.execute-api.us-west-2.amazonaws.com/dev/src
    
Sample Venues Response:

    {
        "city":"San Diego",
        "performer_id":"eec55e4b-28e2-4ae0-a277-c5999416df8a",
        "street_address":"655 Fourth Ave",
        "id":"1b066f07-7abe-4174-9c1d-80042345bbc0",
        "url":"shouthouse.com",
        "country":"United States",
        "name":"Shout House",
        "state":"CA",
        "postal_code":"92101"
    }
