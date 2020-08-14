# Service stripe API

Service: stripe

Stage: dev

Region: us-west-2

Stack: my-request-stripe-stack

AWS Resources:

- API Gateway:
  - my-request-stripe-api
- Lambda:
  - my-request-stripe-lambda
- CloudWatch:
  - my-request-stripe-lambda
- CloudFormation:
  - my-request-stripe-stack

Layers: my-request-libraries-4

Successfully published your service to the [Serverless Dashboard](https://dashboard.serverless.com/tenants/softstack/applications/my-request/services/events/stage/dev/region/us-west-2)
