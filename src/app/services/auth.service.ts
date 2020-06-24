import { Injectable } from "@angular/core";
import { Auth } from "aws-amplify";
import { CognitoUser } from "@aws-amplify/auth";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@ENV";
import { AmplifyService } from "aws-amplify-angular";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { PerformerService } from "@services/performer.service";
import { concatMap, map, filter } from "rxjs/operators";
import { of, pipe } from "rxjs";

export interface NewUser {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

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
  isResetPasswordSuccessful: boolean;

  constructor(
    private http: HttpClient,
    private amplifyService: AmplifyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
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
        let amplifyAuthState = res.authState.state;

        // This will run for all cases, so the data must be shaped accordingly (catchall) -> we do this so we don't handle all logic in the subscribe
        if (amplifyAuthState === "signIn") {
          this.signedIn = amplifyAuthState === "signedIn";
        } else if (amplifyAuthState === "signedIn") {
          // track performer signedIn state
          this.signedIn = amplifyAuthState === "signedIn";

          // save performer and setup some app flags
          this.performerService.storePerformerCreds(res);

          let currentUrl = this.router.url;
          if (currentUrl === "/login") {
            if (this.performerService.isSignedUp === false) {
              // redirect to profile page
              this.router.navigate(["/profile"]);
            } else {
              this.router.navigate(["/dashboard"]);
            }
          }

          Auth.currentAuthenticatedUser({
            bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
          })
            .then((user) => {
              if (user.signInUserSession.idToken.payload["cognito:groups"]) {
                this.performerService.group =
                  user.signInUserSession.idToken.payload["cognito:groups"][0];
              }
            })
            .catch((err) => console.log("error: " + err));
        } else if (amplifyAuthState === "confirmSignUp") {
          // pass, this is needed to create beta testers
        } else {
          // maybe check if a new token is needed to keep the performer signed in?
          this.signedIn = amplifyAuthState === "signedIn";
        }
      });
  }

  login(authState: any) {
    // save amplify's creds
    this.performerAuthState = authState;

    // commented out since we're not using it and it was caused an error because it was too big of an object to store in localstorage
    // localStorage.setItem("performerAuthState", JSON.stringify(authState)); // profile component expects this to be only the user attribute

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
        this.performerService.group = null;
        localStorage.clear();
        this.router.navigate(["login"]);
        return data;
      })
      .catch((err) => err);

    // By doing this, you are revoking all the auth tokens(id token, access token and refresh token)
    // which means the user is signed out from all the devices
    // Note: although the tokens are revoked, the AWS credentials will remain valid until they expire (which by default is 1 hour)
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
    return headers;
  }

  /* Aws Authentication functions below */
  signIn(username: string, password: string): Promise<CognitoUser | any> {
    return new Promise((resolve, reject) => {
      Auth.signIn(username, password)
        .then((user: CognitoUser | any) => {
          // this.loggedIn = true;
          resolve(user);
        })
        .catch((error: any) => reject(error));
    });
  }

  signUp(user: NewUser): Promise<CognitoUser | any> {
    return Auth.signUp({
      username: user.email,
      password: user.password,
      attributes: {
        email: user.email,
        given_name: user.firstName,
        family_name: user.lastName,
        phone_number: user.phone,
      },
    });
  }
}
