import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { VenueService } from "@services/venue.service";
import { EventService } from "@services/event.service";

@Component({
  selector: "app-eventdetails",
  templateUrl: "./event-detail.component.html",
  styleUrls: ["./event-detail.component.scss"],
})
export class EventdetailsComponent implements OnInit {
  event: any;
  loading: boolean = true;
  @Input() grossAmount: any;
  @Input() showStatus: boolean;
  @Input() showEditMenu: boolean;
  @Input()
  set eventData(eventData: any) {
    this.event = null;
    this.venueService.getVenue(eventData.venueId).subscribe((res: any) => {
      this.event = eventData;
      this.event.venue = res.response.body.Item;
      this.loading = false;
    });
  }

  constructor(
    private router: Router,
    private venueService: VenueService,
    private eventService: EventService
  ) {}

  ngOnInit() {}

  navigateToEventOverview() {
    this.router.navigate([`/event-overview/${this.event.id}`]);
  }

  editEvent() {
    this.router.navigate([`/event/${this.event.id}/clone`], {
      state: { event: this.event, venue: this.event.venue },
    });
  }

  navigateToRequests(eventId: string) {
    this.eventService.currentEvent = this.event;
    this.eventService.currentEvent.id = eventId;
    this.router.navigate([`/event/${this.event.id}`]);
  }

  navigateToEventRecap() {
    this.router.navigate([`/history/${this.event.id}`]);
  }

  navigateToEvent() {
    if (this.event.status === "completed") {
      this.navigateToEventRecap();
    } else {
      this.navigateToEventOverview();
    }
  }
}
