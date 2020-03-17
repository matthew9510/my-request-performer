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

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  getEvents() {
    const headers = {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem('performerJwt'),
      })
    }
    return this.http.get(`${environment.performersUrl}/${localStorage.getItem('performerSub')}/events`, headers);
    // return this.http.get('assets/events.json')
  }

  createEvent(event) {
    return this.http.post(environment.eventsUrl, event);
  }

  getVenues(event_id) {
    return this.http.get(environment.venuesUrl, event_id)
  }

  addVenue(venue) {
    // console.log(JSON.stringify(venue))
    return this.http.put(environment.venuesUrl, venue)
  }

  getEvent(eventId) {
    return this.http.get(`${environment.eventsUrl}/${eventId}`)
  }

  updateEvent(eventId, event) {
    return this.http.put(`${environment.eventsUrl}/${eventId}`, event)
  }

  startEvent(eventId) {
    // Invoke changing status of event to started
    // Get currentEvent
    this.getEvent(eventId).subscribe((res: any) => {
      let event = res.response.body.Item;
      console.log("Event before patch", event)

      // Change event status to started
      event.status = "started"
      // Update the event entry with the status changed to started
      this.updateEvent(eventId, event).subscribe((res: any) => {
        // Set appropriate service properties
        this.activeEvent = true;
        this.currentEventId = eventId;
        this.currentEvent = res.response
        console.log("current Event", this.currentEvent)
      })
    })
  }

}
