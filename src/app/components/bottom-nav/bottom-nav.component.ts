import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { EventService } from "../../services/event.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-bottom-nav",
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.scss"],
})
export class BottomNavComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {}

  logout() {
    if (
      this.eventService.currentEvent &&
      this.eventService.currentEvent.status === "active"
    ) {
      this.openConfirmLogoutDialog();
    } else {
      this.authService.logout();
      this.router.navigate(["/login"]);
    }
  }

  openConfirmLogoutDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "300px",
      data: {
        title: "Log out?",
        message:
          "You are running an active event. Are you sure you want to log out?",
        action: "Log out",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.logout();
        this.router.navigate(["/login"]);
      }
    });
  }
}
