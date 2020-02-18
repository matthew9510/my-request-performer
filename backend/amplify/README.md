# AWS Amplify

AWS Amplify is a development platform for building secure, scalable mobile and web applications. It makes it easy for you to authenticate users, 
securely store data and user metadata, authorize selective access to data, integrate machine learning, analyze application metrics, and execute 
server-side code. Amplify covers the complete mobile application development workflow from version control, code testing, to production deployment, 
and it easily scales with your business from thousands of users to tens of millions. The Amplify libraries and CLI, part of the Amplify Framework, 
are open source and offer a pluggable interface that enables you to customize and create your own plugins.

## Amplify Hosting

- App Name: my-request
- URL: https://develop.dwvm1je8bw8y9.amplifyapp.com
- Branches: develop
- Backend Environments: dev
- AWS S3 Bucket: s3://amplify-my-request-dev-133235-deployment
- AWS CloudFormation Stack Name: amplify-my-request-dev-133235
- App ARN: arn:aws:amplify:us-west-2:418615587574:apps/dwvm1je8bw8y9

## Cognito Authorization

- Resource name: myrequest362310f3
- AWS CloudFormation Stack Name: amplify-my-request-dev-133235-authmyrequest362310f3-1TQA2A5YTJKQR
- AWS Lambdas:
    - amplify-my-request-dev-13-UpdateRolesWithIDPFuncti-150M0V1TK1Q98
    - amplify-my-request-dev-13-UpdateRolesWithIDPFuncti-150M0V1TK1Q98
- AWS Cognito User Pool:
    - myrequest362310f3_userpool_362310f3-dev

## Amplify Setup ( Existing Project )

Pull down Amplify Backend. Run the below command from the root directory of the project. Be sure to have the AWS-CLI configured or have your
access key and secret ID available as you will need it to pull down the environment.

Pulling down the backend will create the aws-exports.js file 

    amplify pull --appId dwvm1je8bw8y9 --envName dev
