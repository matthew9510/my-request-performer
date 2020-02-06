import { Component, OnInit } from '@angular/core';
import { PayoutService } from 'src/app/services/payout.service';
import { Requests } from 'src/app/interfaces/requests';

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.scss']
})
export class PayoutComponent implements OnInit {
  acceptedRequests: any;

  constructor(private payoutService: PayoutService) { }

  ngOnInit() {
    this.onFetchRequests()
  }

  onFetchRequests() {
    this.payoutService.fetchRequestInfo()
    .subscribe((res: Requests[]) => this.acceptedRequests = res);
  }
}
