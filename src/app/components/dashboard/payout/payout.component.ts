import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { RequestsService } from "src/app/services/requests.service";
import { EventService } from "src/app/services/event.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSort, MatTableDataSource } from "@angular/material";
import { Router } from "@angular/router";

@Component({
  selector: "app-payout",
  templateUrl: "./payout.component.html",
  styleUrls: ["./payout.component.scss"],
})
export class PayoutComponent implements OnInit {
  completedRequests: any[];
  earnings: number;
  displayedColumns: string[] = ["date", "song", "artist", "amount"];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  completedEvents: any[];

  constructor(
    private requestsService: RequestsService,
    private eventService: EventService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.getCompletedEvents();
    this.onFetchRequests();
  }

  navToEventRecap(eventId: string) {
    this.router.navigate([`history/${eventId}`]);
  }

  getCompletedEvents() {
    this.eventService.getEvents().subscribe((res: any) => {
      this.completedEvents = res.response.body.filter(
        (el: { status: string }) => el.status === "completed"
      );
      for (let event of this.completedEvents) {
        this.requestsService
          .getRequestsByEventId(event.id, "completed")
          .subscribe((res: any) => {
            let total = 0;
            if (res.response.body.length > 0) {
              for (let request of res.response.body) {
                total += request.amount;
              }
            }
            event.grossAmount = total;
          });
      }
    });
  }

  onFetchRequests() {
    this.requestsService
      .getAllRequestsByPerformerId(
        localStorage.getItem("performerSub"),
        "completed"
      )
      .subscribe((requests: any) => {
        this.completedRequests = requests.response.body;
        this.calculateTotalEarnings(requests.response.body);
        // populates the data table and enables sort
        this.dataSource = new MatTableDataSource(this.completedRequests);
        this.dataSource.sort = this.sort;
      });
  }

  calculateTotalEarnings(requests) {
    this.earnings = requests.reduce(
      (total, request) => (total += request.amount),
      0
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
