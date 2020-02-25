import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eventdetails',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventdetailsComponent implements OnInit {
  event: any;

  @Input()
  set eventData(eventData) {
    if (eventData) {
      eventData.date = moment(eventData.date).format('MMM DD');
      this.event = eventData;
    }
  }

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  cloneEvent() {
    this.router.navigate([`/event/${this.event.id}/clone`], { state: this.event });
  }

}
