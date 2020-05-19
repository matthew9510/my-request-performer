import { Component, OnInit } from "@angular/core";
import { EventService } from "src/app/services/event.service";
import { VenueService } from "src/app/services/venue.service";
import { PerformerService } from "src/app/services/performer.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { environment } from "@ENV";
import { MatSnackBar } from "@angular/material/snack-bar";

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
  loading: boolean = true;

  constructor(
    private eventService: EventService,
    private venueService: VenueService,
    private performerService: PerformerService,
    private router: Router,
    private actRoute: ActivatedRoute,
    private location: Location,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.eventId = this.actRoute.snapshot.params.id;
  }

  ngOnInit() {
    this.onGetEventById();
    // snackbar pops up when redirecting from create event or edit event showing it was successful
    if (this.performerService.eventCreatedSnackbar === true) {
      let message = this.performerService.eventCreatedMessage;
      let snackBarRef = this.snackBar.open(message, "Dismiss", {
        duration: 3000,
        verticalPosition: "top",
      });

      snackBarRef.afterDismissed().subscribe(() => {
        this.performerService.eventCreatedSnackbar = false;
      });
    }
  }

  navigateToErrorPage() {
    this.router.navigate(["/error"]);
  }

  onGetEventById() {
    this.eventService.getEvent(this.eventId).subscribe((res: any) => {
      if (res.statusCode === 204) {
        this.navigateToErrorPage();
      } else {
        this.event = res.response.body.Item;
        this.typeOfCoverFee = typeof this.event.coverFee;
        this.venueService.getVenue(this.event.venueId).subscribe((res: any) => {
          this.venue = res.response.body.Item;
          this.performerService
            .getPerformerInfoById(this.event.performerId)
            .subscribe((res: any) => {
              this.performer = res.response.body.Item;
              this.loading = false;
            });
        });
      }
    }),
      (err: any) => this.navigateToErrorPage();
  }

  // hard coding this to navigate back to events until back nav feature is set up
  backClicked() {
    // this.location.back();
    this.router.navigate(["/events"]);
  }

  editEvent() {
    this.router.navigate([`/event/${this.event.id}/clone`], {
      state: { event: this.event, venue: this.venue },
    });
  }

  navigateToRequests(eventId: string) {
    this.eventService.currentEvent = this.event;
    this.eventService.currentEventId = eventId;
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
