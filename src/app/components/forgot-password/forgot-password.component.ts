import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Auth } from "aws-amplify";
import { AuthService } from "@services/auth.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
  hide = true; // display password flag

  // Flags to display error hints to the user
  isUserNotFound: boolean = false;
  isVerificationCodeValid: boolean = true;
  isEmailCollected: boolean = false;

  collectEmailForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
  });
  resetPasswordForm: FormGroup = new FormGroup({
    verificationCode: new FormControl("", [Validators.required]),
    newPassword: new FormControl("", [Validators.required]),
  });

  constructor(private router: Router, private authService: AuthService) {}
  ngOnInit() {}

  get emailInput() {
    return this.collectEmailForm.get("email");
  }

  get verificationCodeInput() {
    return this.resetPasswordForm.get("verificationCode");
  }

  get newPasswordInput() {
    return this.resetPasswordForm.get("newPassword");
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
    if (this.newPasswordInput.hasError("required")) {
      return "A password is required.";
    }
  }

  // Clear flags and state when user cancels the updating password flow
  resetState() {
    this.hide = true;
    this.isUserNotFound = false;
    this.isVerificationCodeValid = true;
    this.isEmailCollected = true;
  }

  // Trigger Aws to send code to performers email
  sendCode() {
    // reset flags for errors
    this.isUserNotFound = false;

    Auth.forgotPassword(this.emailInput.value)
      .then((data) => {
        this.isEmailCollected = true;
      })
      .catch((err) => {
        if (err.name === "UserNotFoundException") {
          this.isUserNotFound = true;
        }
        console.log(err);
      });
  }

  updatePassword() {
    // reset flags for errors
    this.isVerificationCodeValid = true;

    // Collect confirmation code and new password, then
    Auth.forgotPasswordSubmit(
      this.emailInput.value,
      this.verificationCodeInput.value,
      this.newPasswordInput.value
    )
      .then((data) => {
        this.authService.isResetPasswordSuccessful = true;
        this.router.navigate(["/login"]); // pass in a flag to say password reset successsfully
      })
      .catch((err) => {
        if (err.name === "CodeMismatchException") {
          this.isVerificationCodeValid = false;
        }
        console.log(err);
      });
  }
}
