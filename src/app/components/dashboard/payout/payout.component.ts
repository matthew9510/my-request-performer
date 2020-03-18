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

  public acceptedRequests = [];
  earnings: number;

  constructor(
    private requestsService: RequestsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.onFetchRequests();
  }

  onFetchRequests() {
    // let data = this.requestsService.fetchAcceptedRequests()
    //   .subscribe((requests: Requests[]) => {
    //     this.acceptedRequests = requests;
    //     this.calculateTotalEarnings(requests);
    //   });
  }

  calculateTotalEarnings(requests) {
    this.earnings = requests.reduce((total, request) => total += request.amount, 0)
  }

  onChangeStatus(event) {

  }
}
