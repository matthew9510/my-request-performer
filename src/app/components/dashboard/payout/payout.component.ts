import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { Requests } from 'src/app/interfaces/requests';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.scss']
})
export class PayoutComponent implements OnInit {

  public completedRequests = [];
  earnings: number;

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
        console.log(requests.response.body)
        this.completedRequests = requests.response.body;
        this.calculateTotalEarnings(requests.response.body);
      });
  }

  calculateTotalEarnings(requests) {
    this.earnings = requests.reduce((total, request) => total += request.amount, 0)
  }

  onChangeStatus(event) {

  }
}
