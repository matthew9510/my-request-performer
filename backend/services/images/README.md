# Images API

Service: my-request-images-api

Stage: dev

Region: us-west-2

Stack: my-request-images-api

Resources: 46

Api keys: None

Layers: None

Serverless: Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/my-request-images-api/stage/dev/region/us-west-2)

Endpoints:

    POST - https://a3z82jmv72.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://a3z82jmv72.execute-api.us-west-2.amazonaws.com/dev/src
    GET - https://a3z82jmv72.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    PUT - https://a3z82jmv72.execute-api.us-west-2.amazonaws.com/dev/src/{id}
    DELETE - https://a3z82jmv72.execute-api.us-west-2.amazonaws.com/dev/src/{id}
  
Functions:

    create: my-request-images-api-dev-create
    list: my-request-images-api-dev-list
    get: my-request-images-api-dev-get
    update: my-request-images-api-dev-update
    delete: my-request-images-api-dev-delete
 
Sample CURL command:

    curl https://a3z82jmv72.execute-api.us-west-2.amazonaws.com/dev/src
    
Sample Images Response:

    {
        "path":"https://www.gaslamp.org/wp-content/uploads/2018/05/SH-logo.png",
        "id":"0d97c217-f8be-41ad-9e3a-84af3e183326"
    }
