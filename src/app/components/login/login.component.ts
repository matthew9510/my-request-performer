import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AmplifyService } from "aws-amplify-angular";
import { AuthService } from "@services/auth.service";
import { CognitoUser } from "@aws-amplify/auth";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  hide: boolean = true; // displaying password flag
  isInvalidCredentials: boolean = false; // flag to present credentials error to users
  appEmail: string;

  constructor(
    public auth: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.appEmail = environment.appEmail;
    if (this.auth.isResetPasswordSuccessful === true) {
      let message = "Password changed successfully";
      let snackBarRef = this._snackBar.open(message, "Dismiss", {
        duration: 5000,
        verticalPosition: "bottom",
      });

      snackBarRef.afterDismissed().subscribe(() => {
        this.auth.isResetPasswordSuccessful = false;
      });
    }
  }

  signInForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
    password: new FormControl("", [Validators.required, Validators.min(6)]),
  });

  get emailInput() {
    return this.signInForm.get("email");
  }
  get passwordInput() {
    return this.signInForm.get("password");
  }

  getEmailInputError() {
    if (this.emailInput.hasError("email")) {
      return "Please enter a valid email address.";
    }
    if (this.emailInput.hasError("required")) {
      return "An Email is required.";
    }
  }

  getPasswordInputError() {
    if (this.passwordInput.hasError("required")) {
      return "A password is required.";
    }
  }

  signIn() {
    // reset presenting error to user on new try
    this.isInvalidCredentials = false;

    this.auth
      .signIn(this.emailInput.value, this.passwordInput.value)
      .then((user: CognitoUser | any) => {
        // don't do anything, auth service will handle everything
      })
      .catch((error: any) => {
        switch (error.code) {
          case "UserNotFoundException":
            this.isInvalidCredentials = true;
            break;
          case "NotAuthorizedException":
            this.isInvalidCredentials = true;
            break;
          default:
            break;
        }
      });
  }
}
