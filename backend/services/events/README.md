# Service Events API

Service: events

Stage: dev

Region: us-west-2

Stack: my-request-events-stack

AWS Resources: 
   - API Gateway:
        - my-request-events-api
   - DynamoDB:
        - my-request-events-table
   - Lambda: 
        - my-request-events-lambda
   - S3:
        - my-request-events-stack-serverlessdeploymentbucke-wew29vy9i4fu
   - CloudWatch:
        - my-request-events-lambda
   - CloudFormation: 
        - my-request-events-stack

Layers: my-request-libraries

Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/events/stage/dev/region/us-west-2)

Endpoints:

    ANY - https://qcvyxnimu4.execute-api.us-west-2.amazonaws.com/dev/events

    
Sample Events Response:

    {
        "success": "Successfully found item in the events table!",
        "response": {
            "image_id": "0d97c217-f8be-41ad-9e3a-84af3e183326",
            "status": "Lit",
            "date_created": "2020-02-23",
            "url": "softstackfactory.com",
            "genre": "90's Gangsta Rap",
            "event_start_time": "1620",
            "performer_id": "08cdaf46-a954-4c39-8f84-88e3d6b02551",
            "cover_fee": "5",
            "event_end_time": "2330",
            "venue_id": "d7cfa70b-8684-43ac-b72e-7005dcf27202",
            "description": "Sample Description",
            "id": "61c0c930-55d9-11ea-bc57-094861885104",
            "event_date": "2020-04-20",
            "title": "Sample Title"
        }
    }



