import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { RequestsService } from "src/app/services/requests.service";
import { EventService } from "src/app/services/event.service";
import { VenueService } from "src/app/services/venue.service";
import { MatSort, MatTableDataSource } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";

@Component({
  selector: "app-history",
  templateUrl: "./history.component.html",
  styleUrls: ["./history.component.scss"],
})
export class HistoryComponent implements OnInit {
  completedRequests: any[];
  tips: any[];

  earnings: number;
  displayedColumns: string[] = ["modifiedOn", "song", "artist", "amount"];
  displayedColumnsTips: string[] = [
    "modifiedOn",
    "firstName",
    "lastName",
    "memo",
    "amount",
  ];

  requestsDataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, { static: false }) requestsSort: MatSort;

  tipsDataSource: MatTableDataSource<any>;
  @ViewChild("tipSort", { static: false }) tipsSort: MatSort;
  eventId: string;
  event: any;
  venue: any;
  loading: boolean = true;

  constructor(
    private requestsService: RequestsService,
    private eventService: EventService,
    private venueService: VenueService,
    private router: Router,
    private actRoute: ActivatedRoute,
    private location: Location
  ) {
    this.eventId = this.actRoute.snapshot.params.id;
  }

  ngOnInit() {
    this.onGetEventById();
    this.onFetchRequests(this.eventId);
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
        this.venueService.getVenue(this.event.venueId).subscribe((res: any) => {
          this.venue = res.response.body.Item;
          this.loading = false;
        });
      }
    }),
      (err: any) => this.navigateToErrorPage();
  }

  onFetchRequests(eventId: string) {
    this.requestsService
      .getRequestsByEventId(eventId, "completed")
      .subscribe((requests: any) => {
        this.completedRequests = requests.response.body.filter(
          (request: any) => {
            if (
              (request.amount === 0 &&
                request.id !== request.originalRequestId) ||
              request.isTip
            ) {
              return false;
            }
            return true;
          }
        );
        this.tips = requests.response.body.filter((request: any) => {
          if (!request.isTip) {
            return false;
          }
          return true;
        });
        this.calculateTotalEarnings(requests.response.body);
        // populates the data table and enables sort
        this.requestsDataSource = new MatTableDataSource(
          this.completedRequests
        );
        this.requestsDataSource.sort = this.requestsSort;

        this.tipsDataSource = new MatTableDataSource(this.tips);
        this.tipsDataSource.sort = this.tipsSort;
      });
  }

  calculateTotalEarnings(requests) {
    this.earnings = requests.reduce(
      (total: any, request: { amount: any }) => (total += request.amount),
      0
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.requestsDataSource.filter = filterValue.trim().toLowerCase();
    this.tipsDataSource.filter = filterValue.trim().toLowerCase();
  }

  backClicked() {
    this.router.navigate(["/dashboard"]);
    // this.location.back();
  }
}
