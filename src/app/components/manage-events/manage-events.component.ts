import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Events } from '../../services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-events',
  templateUrl: './manage-events.component.html',
  styleUrls: ['./manage-events.component.scss']
})
export class ManageEventsComponent implements OnInit {
  events: any;
  history: boolean;
  searchText: string;
  eventsListTitle: string = 'Scheduled Events';
  // activeEvents: any;

  constructor(private eventService: EventService, private router: Router) {
  }

  ngOnInit() {
    this.getEventsByStatus('created');
  }

  getEventsByStatus(status: string) {
    this.eventService.getEvents()
      .subscribe((res) => {
        this.events = null;
        this.events = res['response']['body']
          .filter((el: { status: string; }) => el.status === status);
        console.log(this.events)
      })
  }

  getAllEvents() {
    this.eventService.getEvents()
      .subscribe((res: any) => {
        this.events = res.response.body;
      });
  }

  routeToCreateEvent() {
    this.router.navigate(['/create-event'])
  }

}
