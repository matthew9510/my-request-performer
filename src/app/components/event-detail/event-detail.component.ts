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
  clone: any;

  @Input()
  set eventData(eventData) {
    if (eventData) {
      eventData.date = moment(eventData.date).format('MMM DD');
      this.event = eventData;
    }
  }

  @Input()
  set cloneEventDate(data) {
    if (data) {
      data.date = moment(data.date).format('MMM DD');
      this.clone = data;
    }
  }

  constructor() { }

  ngOnInit() {
  }

  cloneEvent(event) {
    this.clone = event;
  }

}
