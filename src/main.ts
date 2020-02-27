import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import Amplify from '@aws-amplify/core';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

Amplify.configure({
  // OPTIONAL - if your API requires authentication
  // Auth: {
  //   // REQUIRED - Amazon Cognito Identity Pool ID
  //   identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
  //   // REQUIRED - Amazon Cognito Region
  //   region: 'XX-XXXX-X',
  //   // OPTIONAL - Amazon Cognito User Pool ID
  //   userPoolId: 'XX-XXXX-X_abcd1234',
  //   // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
  //   userPoolWebClientId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3',
  // },
  API: {
    endpoints: [
      {
        name: 'my-request-requests-api',
        endpoint: 'https://y05btwgzvf.execute-api.us-west-2.amazonaws.com/dev/'
      },
      {
        name: 'my-request-events-api',
        endpoint: 'https://qcvyxnimu4.execute-api.us-west-2.amazonaws.com/dev/events',

      }
    ]
  }
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
