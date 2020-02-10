import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Events } from '../../services/event.service';


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
    this.getEvents();
  }

  getEvents() {
    this.eventService.getEvents()
      .subscribe((res: Events[]) => {
        this.events = res;
      });
  }

}
