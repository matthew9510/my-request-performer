import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../services/auth.service";
import { Router } from "@angular/router";
import { Location } from "@angular/common";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  backClicked() {
    this.location.back();
  }
}
