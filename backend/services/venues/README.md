# Service Template API

Service: <_SERVICENAME_>

Stage: <_STAGE_>

Region: <_REGION_>

Stack: <_STACK_NAME_>

Resources: <_RESOURCES_>

Layers: <_LAYERS_>

Serverless: Successfully published your service to the [Serverless Dashboard](<_LINK_TO_SERVERLESS_DASHBOARD_>)

Endpoints:

    PUT - <_URL_>
    GET - <_URL_{id}>
    PATCH - <_URL_{id}>
    DELETE - <_URL_{id}>
  
Functions:

    create: my-request-events-api-dev-create
 
Sample CURL command:

    curl <_URL_>
    
Sample Events Response:

    {
        "KEY":"VALUE",
        "KEY":"VALUE",
        "KEY":"VALUE",
        "KEY":"VALUE"
    }

# Steps to Create Endpoint
* Copy template directory and paste in services directory, name after endpoint
* Change service name in serverless.yml to endpoint name
* In `src/app.js`, replace all the text `events` with the name of your endpoint
* Run `sls deploy` from same directory as YAML file


