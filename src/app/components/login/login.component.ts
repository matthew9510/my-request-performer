import { Component, OnInit } from '@angular/core';
import { AmplifyService } from 'aws-amplify-angular';
import { Router } from '@angular/router';

import { AuthService } from '@services/auth.service';

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
        switch (authState.state) {
          case 'signedIn':
            this.authService.login(authState)
            this.router.navigate(['/dashboard']);
            break;
          default:
            if (!authState.user) {
              this.authService.signedIn = authState.state === 'signedIn';
            }
        }
      });
  }

  ngOnInit() {
  }

}
