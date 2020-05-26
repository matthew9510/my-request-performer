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

  // Error message displays when error with email form occurs
  errorMessage: string;
  showErrorMessage: boolean = false;

  // Error that displays when update password form cannot be completed
  showSubmitErrorMessage: boolean = true;
  submitErrorMessage: string;

  collectEmailForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
  });
  resetPasswordForm: FormGroup = new FormGroup({
    verificationCode: new FormControl("", [Validators.required]),
    newPassword: new FormControl("", [
      Validators.required,
      Validators.pattern(
        /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%?=*&]).{8,20})/
      ),
      Validators.min(8),
    ]),
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

  // Clear flags and state when user cancels the updating password flow
  resetState() {
    this.hide = true;
    this.isUserNotFound = false;
    this.isVerificationCodeValid = true;
    this.isEmailCollected = true;
    this.showErrorMessage = false;
    this.showSubmitErrorMessage = false;
  }

  // Trigger Aws to send code to performers email
  sendCode() {
    // reset flags for errors
    this.isUserNotFound = false;
    this.showErrorMessage = false;

    Auth.forgotPassword(this.emailInput.value)
      .then((data) => {
        this.isEmailCollected = true;
      })
      .catch((err) => {
        if (err.name === "UserNotFoundException") {
          this.isUserNotFound = true;
          this.errorMessage =
            "Email is not registered with My Request Platform";
        } else if ("LimitExceededException") {
          this.showErrorMessage = true;
          this.errorMessage = err.message;
        } else {
          this.showErrorMessage = true;
          this.errorMessage = "Error. Your request could not be completed.";
        }
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
      .catch((err: any) => {
        if (err.name === "CodeMismatchException") {
          this.isVerificationCodeValid = false;
        } else {
          this.submitErrorMessage =
            "Error. Your request could not be completed.";
          this.showSubmitErrorMessage = true;
        }
      });
  }
}
