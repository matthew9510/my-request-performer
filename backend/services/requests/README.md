# Events API

Service: my-request-events-api

Stage: dev

Region: us-west-2

Stack: my-request-events-api

Resources: 46

Api keys: None

Layers: None

Serverless: Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/my-request-events-api/stage/dev/region/us-west-2)

Endpoints:

    POST - https://vph19w9jwe.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://vph19w9jwe.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://vph19w9jwe.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    PUT - https://vph19w9jwe.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    DELETE - https://vph19w9jwe.execute-api.us-west-2.amazonaws.com/dev/src/{id}
  
Functions:

    create: my-request-events-api-dev-create
    list: my-request-events-api-dev-list
    get: my-request-events-api-dev-get
    update: my-request-events-api-dev-update
    delete: my-request-events-api-dev-delete
 
Sample CURL command:

    curl https://vph19w9jwe.execute-api.us-west-2.amazonaws.com/dev/src
    
Sample Events Response:

    {
        "image_id":"0d97c217-f8be-41ad-9e3a-84af3e183326",
        "status":"pending",
        "start_time":"1800",
        "end_time":"2300",
        "url":"shouthouse.com",
        "genre":"80s",
        "performer_id":"08cdaf46-a954-4c39-8f84-88e3d6b02551",
        "date":"2020-02-17",
        "cover_fee":"$10",
        "venue_id":"d7cfa70b-8684-43ac-b72e-7005dcf27202",
        "description":"This is just a sample description for the events table.",
        "id":"705346f8-c9da-4dc4-b0b8-6898595dcaaf","title":"80s Night!"
    }



