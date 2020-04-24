import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { filter, map, mergeMap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { EventService } from "../../services/event.service";
import { AuthService } from "../../services/auth.service";
import { Location } from "@angular/common";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  hideBackButton: boolean = true;
  isRoot: boolean;
  public pageTitle: string;
  displayEventTitle: boolean = false;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private eventService: EventService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit() {
    this.subscribeToRouteChangeEvents();
  }

  backClicked() {
    this.location.back();
  }

  private setTitleFromRouteData(routeData: any) {
    if (routeData && routeData.title) {
      this.pageTitle = routeData.title;
    } else {
      this.pageTitle = "My Request";
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
      .subscribe((event: any) => {
        // Sets the page title to the name of the event, but doesn't work if the currentEvent is not populated yet
        if (event.title === "Requests" && this.eventService.currentEvent) {
          this.pageTitle = this.eventService.currentEvent.title;
        } else {
          this.setTitleFromRouteData(event);
        }
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
