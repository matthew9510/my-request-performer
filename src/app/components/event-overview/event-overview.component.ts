import { Component, OnInit } from "@angular/core";
import { EventService } from "src/app/services/event.service";
import { VenueService } from "src/app/services/venue.service";
import { PerformerService } from "src/app/services/performer.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { environment } from "@ENV";

@Component({
  selector: "app-event-overview",
  templateUrl: "./event-overview.component.html",
  styleUrls: ["./event-overview.component.scss"],
})
export class EventOverviewComponent implements OnInit {
  eventId: string;
  event: any;
  venue: any;
  performer: any;
  typeOfCoverFee: string;
  baseUrl: string = environment.baseUrl;

  constructor(
    private eventService: EventService,
    private venueService: VenueService,
    private performerService: PerformerService,
    private router: Router,
    private actRoute: ActivatedRoute,
    private location: Location,
    public dialog: MatDialog
  ) {
    this.eventId = this.actRoute.snapshot.params.id;
  }

  ngOnInit() {
    this.onGetEventById();
  }

  onGetEventById() {
    this.eventService.getEvent(this.eventId).subscribe((res: any) => {
      this.event = res.response.body.Item;
      this.typeOfCoverFee = typeof this.event.coverFee;
      this.venueService.getVenue(this.event.venueId).subscribe((res: any) => {
        this.venue = res.response.body.Item;
      });
      this.performerService
        .getPerformerInfoById(this.event.performerId)
        .subscribe((res: any) => {
          this.performer = res.response.body.Item;
        });
    });
  }

  backClicked() {
    this.location.back();
  }

  editEvent() {
    this.router.navigate([`/event/${this.event.id}/clone`], {
      state: { event: this.event, venue: this.venue },
    });
  }

  navigateToRequests(eventId: string) {
    this.eventService.currentEvent = this.event;
    this.eventService.currentEvent.id = eventId;
    this.router.navigate([`/event/${this.event.id}`]);
  }

  cancelEvent() {
    this.openConfirmCancel();
  }

  navigateToEventRecap(eventId: string) {
    this.router.navigate([`/history/${eventId}`]);
  }

  openConfirmCancel(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "300px",
      data: {
        title: "Cancel Event?",
        message:
          "Do you wish to cancel this event? This action cannot be undone.",
        action: "Yes, Cancel Event",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.event.status = "cancelled";
        this.eventService.cancelEvent(this.eventId, this.event);
      }
    });
  }
}
