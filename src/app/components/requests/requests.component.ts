import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { Requests } from '../../interfaces/requests';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  pendingRequests: any;
  acceptedRequests: any;

  constructor(
    private requestsService: RequestsService
  ) { }

  ngOnInit() {
    this.onFetchRequests()
  }

  onFetchRequests() {
    this.requestsService.fetchPendingRequests().subscribe((res: Requests[]) => this.pendingRequests = res);
    this.requestsService.fetchAcceptedRequests().subscribe((res: Requests[]) => this.acceptedRequests = res);
  }

}
