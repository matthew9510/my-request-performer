import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  performerCurrentCredentials: any;
  performerAuthState: any;
  performerSub: string;
  signedIn: boolean = false;

  constructor() {

  }

  logout() {
    localStorage.clear()
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));

    // // By doing this, you are revoking all the auth tokens(id token, access token and refresh token)
    // // which means the user is signed out from all the devices
    // // Note: although the tokens are revoked, the AWS credentials will remain valid until they expire (which by default is 1 hour)
    // Auth.signOut({ global: true })
    //   .then(data => console.log(data))
    //   .catch(err => console.log(err));
  }

  login(authState: any) {
    this.signedIn = authState.state === 'signedIn';

    // store performer logged in authState
    this.performerAuthState = authState.user;
    localStorage.setItem('performerAuthState', JSON.stringify(this.performerAuthState))

    // store performer sub
    this.performerSub = this.performerAuthState.attributes.sub;
    localStorage.setItem('performerSub', this.performerSub)

    // store performer credentials 
    Auth.currentCredentials()
      .then((data) => {
        this.performerCurrentCredentials = data;
        localStorage.setItem('performerCurrentCredentials', JSON.stringify(this.performerCurrentCredentials))
      })
      .catch(err => console.log(err));
  }

  isAuthenticated() {
    // This method can be used to check if a user is logged in when the page is loaded. It will throw an error if there is no user logged in. 
    return Auth.currentAuthenticatedUser({
      bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    })


  }
}
