import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { VenueService } from '@services/venue.service'
import { EventService } from '@services/event.service'

@Component({
  selector: 'app-eventdetails',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventdetailsComponent implements OnInit {
  event: any;
  venue: any;
  shortenedDate: any;

  @Input()
  set eventData(eventData: { date: moment.MomentInput; }) {
    if (eventData) {
      this.shortenedDate = moment(eventData.date).format('MMM DD');
      this.event = eventData;
    }
  }

  constructor(
    private router: Router,
    private venueService: VenueService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.venueService.getVenue(this.event.venueId).subscribe((res: any) => {
      this.venue = res.response.body.Item
    })
  }

  editEvent() {
    this.router.navigate([`/event/${this.event.id}/clone`], { state: { event: this.event, venue: this.venue } });
  }

  startEvent(eventId: any) {
    // this.eventService.startEvent(eventId)
    this.router.navigate([`/event/${this.event.id}`])
  }
}
