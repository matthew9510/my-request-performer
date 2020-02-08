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

  acceptedRequests: any;


  constructor(
    private requestsService: RequestsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.onFetchRequests()
  }

  onFetchRequests() {
    this.requestsService.fetchAcceptedRequests()
    .subscribe((res: Requests[]) => this.acceptedRequests = res);
    console.log(this.acceptedRequests)
  }

  calculateTotalEarnings() {
    let tips = [];
    this.acceptedRequests.forEach(function(request) {
      tips.push(request.amount);
    })
    console.log(tips);
  }

}
