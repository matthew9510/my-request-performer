# Amplify Angular Setup

The `aws-amplify-angular` package is a set of Angular components and an Angular provider which helps integrate your 
application with the AWS-Amplify library. It supports Angular 5.0 or above. It also includes a supplemental module for 
Ionic-specific components.


#### Installation

Install `aws-amplify` and `aws-amplify-angular` npm packages into your Angular app.

    npm install aws-amplify aws-amplify-angular

#### Angular 6+ Support

Currently, the newest versions of Angular (6+) do not include shims for ‘global’ or ‘process’ which were provided in 
previous versions. Add the following to your `polyfills.ts` file to recreate them:
