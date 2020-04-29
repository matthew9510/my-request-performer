import { Component, OnInit } from "@angular/core";
import { EventService } from "../../services/event.service";
import { Router } from "@angular/router";
import { OrderPipe } from "ngx-order-pipe";
import { PerformerService } from "@services/performer.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { translate } from "@ngneat/transloco";
import * as moment from "moment";

@Component({
  selector: "app-manage-events",
  templateUrl: "./manage-events.component.html",
  styleUrls: ["./manage-events.component.scss"],
})
export class ManageEventsComponent implements OnInit {
  events: any;
  history: boolean;
  searchText: string;
  eventsListTitle: string = "Scheduled Events";
  order: string = "date";
  reverse: boolean = false;

  constructor(
    private eventService: EventService,
    private router: Router,
    private orderPipe: OrderPipe,
    private performerService: PerformerService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // switch statement to remember the last option the user chose to filter by and loads the events accordingly
    switch (this.eventService.lastSearchStatus) {
      case "all":
        this.eventsListTitle = "All Events";
        this.getAllEvents();
        break;
      case "created":
        this.eventsListTitle = "Scheduled Events";
        this.getEventsByStatus(this.eventService.lastSearchStatus);
        break;
      case "active":
        this.eventsListTitle = "Active Events";
        this.getEventsByStatus(this.eventService.lastSearchStatus);
        break;
      case "completed":
        this.eventsListTitle = "Past Events";
        this.getEventsByStatus(this.eventService.lastSearchStatus);
        break;
      case "cancelled":
        this.eventsListTitle = "Cancelled Events";
        this.getEventsByStatus(this.eventService.lastSearchStatus);
        break;
    }

    if (this.performerService.showEventsSnackBar == true) {
      let message = translate("manage events.makeAnEvent");
      let snackBarRef = this._snackBar.open(
        "Create your first event!",
        "Dismiss",
        {
          duration: 3000,
          verticalPosition: "bottom",
        }
      );

      snackBarRef.afterDismissed().subscribe(() => {
        this.performerService.showEventsSnackBar = false;
      });
    }
  }

  // sets order for pending requests
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getEventsByStatus(status: string) {
    let now = moment().format();
    this.eventService.lastSearchStatus = status;
    this.events = null;

    // display active events
    // displays events with status === 'active' or 'paused' and with a date in the future
    if (status === "active") {
      this.eventService.getEvents().subscribe((res: any) => {
        this.events = res.response.body.filter(
          (el: { status: string; date: string }) =>
            (el.status === "active" || el.status === "paused") &&
            moment(el.date).isSameOrAfter(now)
        );
      });
      // display upcoming events
      // displays events with status === 'created' with a date in the future
    } else if (status === "created") {
      this.eventService.getEvents().subscribe((res: any) => {
        this.events = res.response.body.filter(
          (el: { status: string; date: string }) =>
            el.status === status && moment(el.date).isSameOrAfter(now)
        );
      });
      // display past events
      // displays events with status === 'completed' or with a date in the future
    } else if (status === "completed") {
      this.eventService.getEvents().subscribe((res: any) => {
        this.events = res.response.body.filter(
          (el: { status: string; date: string }) =>
            (el.status === status || moment(el.date).isBefore(now)) &&
            el.status !== "cancelled"
        );
      });
      // display cancelled events
      // displays events with status === 'cancelled'
    } else {
      this.eventService.getEvents().subscribe((res: any) => {
        this.events = res.response.body.filter(
          (el: { status: string }) => el.status === status
        );
      });
    }
  }

  getAllEvents() {
    this.eventService.lastSearchStatus = "all";
    this.events = null;
    this.eventService.getEvents().subscribe((res: any) => {
      this.events = res.response.body;
    });
  }

  routeToCreateEvent() {
    this.router.navigate(["/create-event"]);
  }

  navigateToEventOverview(eventId: string) {
    this.router.navigate([`/event-overview/${eventId}`]);
  }
}
