import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { filter, map, mergeMap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { EventService } from "../../services/event.service";
import { AuthService } from "../../services/auth.service";
import { PerformerService } from "@services/performer.service";
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
  eventTitle: string;
  eventId: string;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private eventService: EventService,
    private authService: AuthService,
    private location: Location,
    private performerService: PerformerService
  ) {}

  ngOnInit() {
    this.subscribeToRouteChangeEvents();
  }

  backClicked() {
    this.location.back();
  }

  getEventTitle() {
    this.eventService
      // activeRoute.snapshot["_routerState"]["url"].slice(7) === event id
      // this grabs the current route URL and transforms it into the event id only
      .getEvent(this.activeRoute.snapshot["_routerState"]["url"].slice(7))
      .subscribe((res: any) => {
        this.eventTitle = res.response.body.Item.title;
        this.displayEventTitle = true;
      });
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
        // Sets page title for the app
        if (event.title === "Requests" && this.eventService.currentEvent) {
          this.eventTitle = this.eventService.currentEvent.title;
          this.displayEventTitle = true;
        } else if (event.title === "Requests") {
          this.getEventTitle();
        } else {
          this.setTitleFromRouteData(event);
          this.displayEventTitle = false;
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

  navToAdmin() {
    this.router.navigate(["/admin"]);
  }
}
