import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { filter, map, mergeMap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { EventService } from "../../services/event.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  public pageTitle: string;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscribeToRouteChangeEvents();
  }

  private setTitleFromRouteData(routeData) {
    if (routeData && routeData["title"]) {
      this.pageTitle = routeData["title"];
    } else {
      this.pageTitle = "No title";
    }
  }

  private getLatestChild(route) {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private subscribeToRouteChangeEvents() {
    // Set initial title
    const latestRoute = this.getLatestChild(this.activeRoute);
    if (latestRoute) {
      this.setTitleFromRouteData(latestRoute.data.getValue());
    }
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activeRoute),
        map((route) => this.getLatestChild(route)),
        filter((route) => route.outlet === "primary"),
        mergeMap((route) => route.data)
      )
      .subscribe((event) => {
        this.setTitleFromRouteData(event);
      });
  }

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

  navToProfile() {
    this.router.navigate(["/profile"]);
  }
}
