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
  venue: any;
  @Input() grossAmount;
  @Input() showStatus: boolean;
  @Input() showEditMenu: boolean;
  @Input()
  set eventData(eventData: any) {
    this.event = eventData;
  }

  constructor(
    private router: Router,
    private venueService: VenueService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.venueService.getVenue(this.event.venueId).subscribe((res: any) => {
      this.venue = res.response.body.Item;
    });
  }

  editEvent() {
    this.router.navigate([`/event/${this.event.id}/clone`], {
      state: { event: this.event, venue: this.venue },
    });
  }

  navigateToEvent(eventId: string) {
    this.eventService.currentEvent = this.event;
    this.eventService.currentEvent.id = eventId;
    this.router.navigate([`/event/${this.event.id}`]);
  }

  navigateToEventRecap(eventId: string) {
    this.router.navigate([`/history/${eventId}`]);
  }
}
