# Service Requester APIs

[Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/requester/stage/dev/region/us-west-2)

service: requester

stage: dev

region: us-west-2

stack: my-request-requester-stack

Endpoint:

    ANY - https://npfjwp3yrd.execute-api.us-west-2.amazonaws.com/dev/requester

# Endpoint Test Using Postman

We'll be using Postman to populate our new table with test data using a PUT request.

##### Postman Configuration:

- Endpoint: https://npfjwp3yrd.execute-api.us-west-2.amazonaws.com/dev/requester
- Authorization: no auth

##### Populate with sample data

- From the body tab select 'raw' of type JSON
- Provide Payload

        {
          "first_name": "Michael",
          "last_name": "Martin",
          "street_address": "701 J St",
          "city": "San Diego",
          "state": "CA",
          "postal_code": "92101",
          "country": "United States",
          "email": "michael.gene.martin@gmail.com",
          "password": "abcd1234",
          "fingerprint_id": 19,
          "event_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
          "stripe_customer_id": null
        }

Successful PUT Response:

    {
        "success": "Successfully added item to the requester table!",
        "record": {
            "first_name": "Michael",
            "last_name": "Martin",
            "street_address": "701 J St",
            "city": "San Diego",
            "state": "CA",
            "postal_code": "92101",
            "country": "United States",
            "email": "michael.gene.martin@gmail.com",
            "password": "abcd1234",
            "fingerprint_id": 19,
            "event_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
            "stripe_customer_id": null,
            "id": "03efc660-561c-11ea-8c19-352d0ade63d8",
            "date_created": "2020-02-23"
        }
    }

##### Check record with GET Request:

- From the body tab select 'none'
- Currently ALL GET requests require a id
- From the params tab provide the following key & value
  - Key: id
  - Value: 03efc660-561c-11ea-8c19-352d0ade63d8

Successful GET Request

    {
        "success": "Successfully found item 03efc660-561c-11ea-8c19-352d0ade63d8 in the requester table!",
        "response": {
            "fingerprint_id": 19,
            "street_address": "701 J St",
            "date_created": "2020-02-23",
            "email": "michael.gene.martin@gmail.com",
            "country": "United States",
            "stripe_customer_id": null,
            "state": "CA",
            "postal_code": "92101",
            "city": "San Diego",
            "password": "abcd1234",
            "last_name": "Martin",
            "first_name": "Michael",
            "event_id": "705346f8-c9da-4dc4-b0b8-6898595dcaaf",
            "id": "03efc660-561c-11ea-8c19-352d0ade63d8"
        }
    }
