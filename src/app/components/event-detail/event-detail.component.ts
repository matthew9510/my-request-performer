import {Component, Input, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';

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

  constructor() { }

  ngOnInit() {
  }

  editEvent(id) {
    alert(`Redirecting to manage event for event with the ID of ${id} `)
  }

}
