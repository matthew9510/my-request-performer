# Service Information
- service: my-request-api-service
- stage: dev
- region: us-west-2
- stack: my-request-api-service-dev
- resources: 46
- api keys: None

endpoints:

    POST - https://h4tieuu9nc.execute-api.us-west-2.amazonaws.com/dev/events
    GET - https://h4tieuu9nc.execute-api.us-west-2.amazonaws.com/dev/events
    GET - https://h4tieuu9nc.execute-api.us-west-2.amazonaws.com/dev/events/{id}
    PUT - https://h4tieuu9nc.execute-api.us-west-2.amazonaws.com/dev/events/{id}
    DELETE - https://h4tieuu9nc.execute-api.us-west-2.amazonaws.com/dev/events/{id}

functions:

    create: my-request-api-service-dev-create
    list: my-request-api-service-dev-list
    get: my-request-api-service-dev-get
    update: my-request-api-service-dev-update
    delete: my-request-api-service-dev-delete

layers:
- None

Serverless: Successfully published your service to the Serverless Dashboard: [Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/my-request-api-service/stage/dev/region/us-west-2)

* Sample Curl commands for testing:
    - curl https://h4tieuu9nc.execute-api.us-west-2.amazonaws.com/dev/events
    
    
