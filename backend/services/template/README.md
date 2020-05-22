# Service TEMPLATE API/s

[Serverless Dashboard](TEMPLATE)

service: TEMPLATE

stage: dev

region: us-west-2

stack: my-request-TEMPLATE-stack

Endpoints:

    ANY - https://TEMPLATE.execute-api.us-west-2.amazonaws.com/dev/TEMPLATE
    
# Endpoint Test Using Postman

We'll be using Postman to populate our new table with test data using a PUT request.

##### Postman Configuration:
- Endpoint: TEMPLATE
- Authorization: no auth

##### Populate with sample data
- From the body tab select 'raw' of type JSON
- Provide Payload

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
    
