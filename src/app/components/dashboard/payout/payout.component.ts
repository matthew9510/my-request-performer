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


  constructor(
    private requestsService: RequestsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.onFetchRequests()
    this.calculateTotalEarnings()
  }

  onFetchRequests() {
    let data = this.requestsService.fetchAcceptedRequests()
    .subscribe((res: Requests[]) => this.acceptedRequests = res);
    console.log(data);
  }

  calculateTotalEarnings() {
    let tips = [];
    // this.acceptedRequests.forEach(function(request) {
    //   tips.push(request.amount);
    // });
    console.log('hello world');
  }

}
