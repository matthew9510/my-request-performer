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

#### Setup

When working with underlying aws-js-sdk, the “node” package should be included in types compiler option. update your src/tsconfig.app.json:

    "compilerOptions": {
        "types" : ["node"]
    }

#### Importing the Amplify Angular Module and the Amplify Provider

Configuring the Amplify provider with specified Amplify JS modules

Import the configuration file and load it in main.ts:

    import Amplify from '@aws-amplify/core';
    import awsconfig from './aws-exports';
    Amplify.configure(awsconfig);
