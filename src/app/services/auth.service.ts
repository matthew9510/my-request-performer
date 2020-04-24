import { Injectable } from "@angular/core";
import { Auth } from "aws-amplify";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@ENV";
import { AmplifyService } from "aws-amplify-angular";
import { Router } from "@angular/router";
import { PerformerService } from "@services/performer.service";
import { concatMap, map } from "rxjs/operators";
import { of, pipe } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  performerCurrentCredentials: any;
  performerAuthState: any;
  performerSub: string;
  performerJwt: string;
  user: any;
  greeting: string;
  signedIn: boolean;

  constructor(
    private http: HttpClient,
    private amplifyService: AmplifyService,
    private router: Router,
    private performerService: PerformerService
  ) {
    this.amplifyService.authStateChange$
      .pipe(
        concatMap((authState) => {
          if (authState.state === "signedIn") {
            return this.login(authState);
          } else {
            // standardize the data shape for the subscribe function to handle multiple cases
            return of({ authState: authState });
          }
        })
      )
      .subscribe((res: any) => {
        // This will run for all cases, so the data must be shaped accordingly (catchall) -> we do this so we don't handle all logic in the subscribe
        if (res.authState.state === "signIn") {
          this.signedIn = res.authState.state === "signedIn";
        } else if (res.authState.state === "signedIn") {
          this.performerService.storePerformerCreds(res);
        } else {
          this.signedIn = res.authState.state === "signedIn";
        }
      });
  }

  login(authState: any) {
    // track performer signedIn state
    this.signedIn = authState.state === "signedIn";

    // save amplify's creds
    this.performerAuthState = authState;
    localStorage.setItem("performerAuthState", JSON.stringify(authState)); // profile component expects this to be only the user attribute

    // create a temporary variable for easier access below
    let awsUser = authState.user;

    // save performer sub
    this.performerSub = awsUser.attributes.sub;
    localStorage.setItem("performerSub", awsUser.attributes.sub);

    // save performer jwt
    this.performerJwt = awsUser.signInUserSession.idToken.jwtToken;
    localStorage.setItem(
      "performerJwt",
      awsUser.signInUserSession.idToken.jwtToken
    );

    // using performer aws sub, go get the performer entry in the db
    return this.performerService
      .getPerformerInfoById(awsUser.attributes.sub)
      .pipe(
        map((performer) => {
          // standardize the data shape for the subscribe function to handle multiple cases
          return { performer: performer, authState: authState };
        })
      );
  }

  logout() {
    Auth.signOut()
      .then((data) => {
        // Reset state of app and flags
        this.signedIn = false;
        this.performerService.isSignedUp = false;
        this.performerService.showEventsSnackBar = true;
        this.performerCurrentCredentials = null;
        this.performerAuthState = null;
        this.performerSub = null;
        this.performerJwt = null;
        this.performerService.performer = null;
        localStorage.clear();
        this.router.navigate(["login"]);
        return data;
      })
      .catch((err) => console.log(err));

    // // By doing this, you are revoking all the auth tokens(id token, access token and refresh token)
    // // which means the user is signed out from all the devices
    // // Note: although the tokens are revoked, the AWS credentials will remain valid until they expire (which by default is 1 hour)
    // Auth.signOut({ global: true })
    //   .then(data => console.log(data))
    //   .catch(err => console.log(err));
  }

  isAuthenticated() {
    // tslint:disable-next-line:max-line-length
    // This method can be used to check if a user is logged in when the page is loaded. It will throw an error if there is no user logged in.
    return Auth.currentAuthenticatedUser({
      // tslint:disable-next-line:max-line-length
      bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    });
  }

  createHeader() {
    const headers = new HttpHeaders().set(
      "Authorization",
      localStorage.getItem("performerJwt")
    );
    // console.log(headers);
    return headers;
  }
}
