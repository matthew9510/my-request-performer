import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {
  isSignedUp: boolean = false;
  userTempPassword: any;
  userEmail: any;
  user: any;
  constructor() {}

  ngOnInit() {}

  showSuccessMessage(event) {
    this.userEmail = event.user.username;
    this.userTempPassword = event.tempPassword;
    this.user = event;
    this.isSignedUp = true;
  }

  showSignUp() {
    this.isSignedUp = false;
  }
}
