# Requester API

Service: my-request-requester-api

Stage: dev

Region: us-west-2

Stack: my-request-requester-api

Resources: 46

Api keys: None

Layers: None

Serverless: Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/my-request-requester-api/stage/dev/region/us-west-2)

Endpoints:

    POST - https://qi8hh5l5za.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://qi8hh5l5za.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://qi8hh5l5za.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    PUT - https://qi8hh5l5za.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    DELETE - https://qi8hh5l5za.execute-api.us-west-2.amazonaws.com/dev/src/{id}
  
Functions:

    create: my-request-requester-api-dev-create
    list: my-request-requester-api-dev-list
    get: my-request-requester-api-dev-get
    update: my-request-requester-api-dev-update
    delete: my-request-requester-api-dev-delete
 
Sample CURL command:

    curl https://qi8hh5l5za.execute-api.us-west-2.amazonaws.com/dev/src
    
Sample Venues Response:

    {
        "fingerprint_id":12,"street_address":"655 Fourth Ave",
        "email":"michael.gene.martin@gmail.com",
        "country":"United States",
        "state":"CA",
        "postal_code":92101,
        "city":"San Diego",
        "strip_customer_id":"None",
        "password":"abcd1234",
        "last_name":"Martin",
        "first_name":"Michael",
        "phone_number":6198081114,
        "event_id":"705346f8-c9da-4dc4-b0b8-6898595dcaaf",
        "id":"8ef9e7c9-8bfb-45ed-938b-152a7910b45c"
    }
