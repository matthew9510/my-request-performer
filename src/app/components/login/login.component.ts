import { Component, OnInit } from '@angular/core';
import { AmplifyService } from 'aws-amplify-angular';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  usernameAttributes = 'email';
  signedIn: boolean;
  user: any;
  greeting: string;

  constructor( private amplifyService: AmplifyService ) {

    this.amplifyService.authStateChange$
      .subscribe(authState => {
        this.signedIn = authState.state === 'signedIn';
        if (!authState.user) {
          this.user = null;
        } else {
          this.user = authState.user;
          this.greeting = 'Hello ' + this.user.username;
        }
      });
  }

  ngOnInit() {

    Auth.currentSession()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }

}
