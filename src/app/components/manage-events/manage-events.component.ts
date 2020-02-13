import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Events } from '../../services/event.service';
import {FormControl} from '@angular/forms';


@Component({
  selector: 'app-manage-events',
  templateUrl: './manage-events.component.html',
  styleUrls: ['./manage-events.component.scss']
})
export class ManageEventsComponent implements OnInit {
  events: any;
  pastEvents: any;
  history: boolean;
  scheduled: boolean;
  searchText: string;

  constructor(private eventService: EventService) {
  }

  ngOnInit() {
  }

  getEvents() {
    this.eventService.getEvents()
      .subscribe((res: Events[]) => {
        this.events = res;
        this.history = false;
        this.scheduled = true;
      });
  }
  getPastEvents() {
    this.eventService.getEvents()
      .subscribe((res: Events[]) => {
        this.pastEvents = res;
        this.history = true;
        this.scheduled = false;
      });
  }

}
