import { Component, OnInit } from "@angular/core";
import { EventService } from "../../services/event.service";
import { Router } from "@angular/router";
import { OrderPipe } from "ngx-order-pipe";

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
    private orderPipe: OrderPipe
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
    this.eventService.lastSearchStatus = status;
    this.eventService.getEvents().subscribe((res: any) => {
      this.events = null;
      this.events = res.response.body.filter(
        (el: { status: string }) => el.status === status
      );
    });
  }

  getAllEvents() {
    this.eventService.lastSearchStatus = "all";
    this.eventService.getEvents().subscribe((res: any) => {
      this.events = res.response.body;
    });
  }

  routeToCreateEvent() {
    this.router.navigate(["/create-event"]);
  }
}
