import "hammerjs";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "@ENV";

import Amplify from "@aws-amplify/core";

Amplify.configure({
  API: {
    endpoints: [
      {
        name: "my-request-requests-api",
        endpoint: "https://y05btwgzvf.execute-api.us-west-2.amazonaws.com/dev/",
      },
      {
        name: "my-request-events-api",
        endpoint:
          "https://qcvyxnimu4.execute-api.us-west-2.amazonaws.com/dev/events",
      },
    ],
  },
  aws_project_region: environment.aws_project_region,
  aws_cognito_region: environment.aws_cognito_region,
  aws_user_pools_id: environment.aws_user_pools_id,
  aws_user_pools_web_client_id: environment.aws_user_pools_web_client_id,
  oauth: {},
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
