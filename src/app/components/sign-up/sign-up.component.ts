import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@services/auth.service";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
})
export class SignUpComponent implements OnInit {
  @Output() successfulBetaAccountCreation = new EventEmitter();
  hide = true;
  isEmailTaken: boolean = false;
  emailTakenMessage: any;
  signupForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
    tempPassword: new FormControl("", [Validators.required]),
    phone: new FormControl("", [Validators.min(10)]),
    fname: new FormControl("", [Validators.min(2)]),
    lname: new FormControl("", [Validators.min(2)]),
  });

  countryCode = "+1";

  get emailInput() {
    return this.signupForm.get("email");
  }
  get passwordInput() {
    return this.signupForm.get("tempPassword");
  }
  get fnameInput() {
    return this.signupForm.get("fname");
  }
  get lnameInput() {
    return this.signupForm.get("lname");
  }
  get phoneInput() {
    return this.signupForm.get("phone");
  }

  constructor(private _authService: AuthService, private _router: Router) {}

  ngOnInit() {}

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

  shouldEnableSubmit() {
    return (
      !this.emailInput.valid ||
      !this.passwordInput.valid ||
      !this.fnameInput.valid ||
      !this.lnameInput.valid ||
      !this.phoneInput.valid
    );
  }

  signUp() {
    // reset error flags
    this.isEmailTaken = false;
    this.emailTakenMessage = undefined;

    this._authService
      .signUp({
        email: this.emailInput.value,
        password: this.passwordInput.value,
        firstName: this.fnameInput.value,
        lastName: this.lnameInput.value,
        phone: "+" + this.phoneInput.value,
      })
      .then((data) => {
        data.tempPassword = this.passwordInput.value;
        // trigger event emitter
        this.successfulBetaAccountCreation.emit(data);
      })
      .catch((error) => {
        if (error.name === "UsernameExistsException") {
          //set errror flags
          this.isEmailTaken = true;
          this.emailTakenMessage = error.message;
        }
        console.log(error);
      });
  }
}
