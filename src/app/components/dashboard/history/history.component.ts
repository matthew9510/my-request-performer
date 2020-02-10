import { Component, OnInit } from '@angular/core';
import {EventService} from 'src/app/services/event.service';
import {Events} from 'src/app/services/event.service';
import * as moment from 'moment';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  events: any;

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.getPastEvents();
  }

  getPastEvents() {
    this.eventService.getEvents()
    .subscribe((res: Events[]) => {
      this.events = res;

      for (let i = 0; i < this.events.lenth; i++) {
        this.events[i].date = moment(this.events[i].date).format('MMM DD');
      }
    });
  }
}
