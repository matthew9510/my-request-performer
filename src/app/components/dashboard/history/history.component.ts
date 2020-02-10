import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { Events } from 'src/app/services/event.service';

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
      });
  }
}
