import { Component, OnInit } from '@angular/core';
import {EventService} from '../../services/event.service';
import {Events} from '../../services/event.service';
import * as moment from 'moment';


@Component({
  selector: 'app-manage-events',
  templateUrl: './manage-events.component.html',
  styleUrls: ['./manage-events.component.scss']
})
export class ManageEventsComponent implements OnInit {
  events: any;

  constructor(private eventService: EventService) {
  }

  ngOnInit() {
    this.getEvents()
  }

  getEvents() {
    this.eventService.getEvents()
      .subscribe((res: Events[]) => {
      this.events = res;

      for (let i = 0; i < this.events.length; i++) {
        this.events[i].date = moment(this.events[i].date).format('MMM DD');
        // this.events[i].date = this.events[i].date.slice(0, -2);
      }
    });
  }

}
