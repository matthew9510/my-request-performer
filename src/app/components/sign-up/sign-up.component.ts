import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
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
  emailTakenMessage: any = "An account with this email already exists.";
  signupForm: FormGroup;
  countryCode = "+1";
  submitErrorMessage: string = "Error. Your request could not be completed.";
  showSubmitErrorMessage: boolean = false;

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

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      email: ["", [Validators.email, Validators.required]],
      tempPassword: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%?=*&]).{8,20})/
          ),
          Validators.min(8),
        ],
      ],
      phone: ["", [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
      fname: ["", Validators.min(2)],
      lname: ["", Validators.min(2)],
    });
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
        phone: `+${this.phoneInput.value.replace(/-/g, "")}`,
      })
      .then((data) => {
        data.tempPassword = this.passwordInput.value;
        // trigger event emitter
        this.successfulBetaAccountCreation.emit(data);
        this.showSubmitErrorMessage = false;
        this.isEmailTaken = false;
      })
      .catch((error) => {
        if (error.name === "UsernameExistsException") {
          this.isEmailTaken = true;
          this.emailTakenMessage = error.message;
        } else {
          this.submitErrorMessage =
            "Error. Your request could not be completed.";
          this.showSubmitErrorMessage = true;
        }
      });
  }
}
