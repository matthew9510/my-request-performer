import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@ENV'
import { Event } from "../interfaces/events"
import { AuthService } from '../services/auth.service'

// alter this to match interface
export interface Events {
  venue: string,
  date: string,
  title: string,
  id: string
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  activeEvent = false;
  currentEventId = null;
  currentEvent = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService) { }

  // gets all events (all statuses) for the performer that is currently logged in
  getEvents() {
    const headers = {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem('performerJwt'),
      })
    }
    return this.http.get(`${environment.performersUrl}/${localStorage.getItem('performerSub')}/events`, headers);
  }

  createEvent(event: Object) {
    return this.http.post(environment.eventsUrl, event);
  }

  getVenues(event_id) {
    return this.http.get(environment.venuesUrl, event_id)
  }

  addVenue(venue: any) {
    // console.log(JSON.stringify(venue))
    return this.http.put(environment.venuesUrl, venue)
  }

  getEvent(eventId: string) {
    return this.http.get(`${environment.eventsUrl}/${eventId}`)
  }

  updateEvent(eventId: any, event: any) {
    return this.http.put(`${environment.eventsUrl}/${eventId}`, event)
  }

  // work in progress
  // shouldn't have to use getEvent() here. should pass event object instead
  startEvent(eventId: string) {
    // Invoke changing status of event to started
    // Get currentEvent
    this.getEvent(eventId).subscribe((res: any) => {
      let event = res['response']['body']['Item'];
      // console.log("Event before patch", event)

      // Change event status to started
      event.status = "active";
      // Update the event entry with the status changed to started
      this.updateEvent(eventId, event)
        .subscribe((res: any) => {
          // Set appropriate service properties
          this.activeEvent = true;
          this.currentEventId = eventId;
          this.currentEvent = res.response
          // console.log("current Event", this.currentEvent)
        })
    })
  }

  // work in progress
  // shouldn't have to use getEvent() here. should pass event object instead
  pauseEvent(eventId: string) {
    // Invoke changing status of event to started
    // Get currentEvent
    this.getEvent(eventId).subscribe((res: any) => {
      let event = res['response']['body']['Item'];

      // Change event status to started
      event.status = "paused";
      // Update the event entry with the status changed to started
      this.updateEvent(eventId, event)
        .subscribe((res: any) => {
          console.log(event)
          // Set appropriate service properties
          // this.activeEvent = true;
          this.currentEventId = eventId;
          this.currentEvent = res.response
        })
    })
  }

  // work in progress
  // shouldn't have to use getEvent() here. should pass event object instead
  endEvent(eventId: string) {
    // Invoke changing status of event to started
    // Get currentEvent
    this.getEvent(eventId).subscribe((res: any) => {
      let event = res['response']['body']['Item'];

      // Change event status to started
      event.status = "completed";
      // Update the event entry with the status changed to started
      this.updateEvent(eventId, event)
        .subscribe((res: any) => {
          // Set appropriate service properties
          // this.activeEvent = true;
          this.currentEventId = eventId;
          this.currentEvent = res.response
        })
    })
  }
}
