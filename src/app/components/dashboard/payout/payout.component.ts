import { Component, OnInit, ViewChild } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.scss']
})
export class PayoutComponent implements OnInit {

  completedRequests: any[];
  earnings: number;
  displayedColumns: string[] = ['song', 'artist', 'amount'];
  dataSource;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private requestsService: RequestsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.onFetchRequests();
  }

  onFetchRequests() {
    this.requestsService.getAllRequestsByPerformerId(localStorage.getItem('performerSub'), "completed")
      .subscribe((requests: any) => {
        // console.log(requests.response.body)
        this.completedRequests = requests.response.body;
        this.calculateTotalEarnings(requests.response.body);
        // populates the data table and enables sort
        this.dataSource = new MatTableDataSource(this.completedRequests);
        this.dataSource.sort = this.sort;
      });
  }

  calculateTotalEarnings(requests) {
    this.earnings = requests.reduce((total, request) => total += request.amount, 0)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
