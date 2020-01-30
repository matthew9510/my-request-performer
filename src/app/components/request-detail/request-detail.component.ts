import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss']
})
export class RequestDetailComponent implements OnInit {

  constructor(
    private requestsService: RequestsService
  ) { }

  ngOnInit() {
    this.onFetchRequests()
  }

  onFetchRequests() {
    this.requestsService.fetchRequests().subscribe(res => console.log(res));
  }

}
