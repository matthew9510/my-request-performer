import { Component, OnInit } from '@angular/core';
import { AmplifyService } from 'aws-amplify-angular';
import { Router } from '@angular/router';
import { consoleTestResultsHandler } from 'tslint/lib/test';
import { AuthService } from '../../services/auth.service';
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
  constructor(private amplifyService: AmplifyService, private router: Router, private authService: AuthService) {
    this.amplifyService.authStateChange$
      .subscribe(authState => {
        this.signedIn = authState.state === 'signedIn';
        switch (authState.state) {
          case 'signedIn':
            console.log(authState.state);
            this.authService.performer = true;
            this.authService.performer = authState.user;
            console.log(this.authService.performer);
            this.router.navigate(['/dashboard']);
            break;
          default:
            // console.log(authState)
            if (!authState.user) {
              this.authService.signedIn = null;
            }
        }
      });
  }

  ngOnInit() {

    Auth.currentSession()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }

}
