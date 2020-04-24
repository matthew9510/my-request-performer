import { Component, OnInit } from "@angular/core";
import { AmplifyService } from "aws-amplify-angular";
import { Router } from "@angular/router";

import { AuthService } from "@services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  usernameAttributes = "email";
  user: any;
  greeting: string;

  constructor(
    private amplifyService: AmplifyService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {}
}
