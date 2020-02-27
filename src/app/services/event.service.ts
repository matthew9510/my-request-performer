import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@ENV'
import { Event } from "../interfaces/events"

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

  constructor(private http: HttpClient) { }

  getEvents() {
    // not sure if this will get all 
    // return this.http.get(environment.eventsUrl);
    return this.http.get('assets/events.json')
  }

  createEvent(event: Event) {
    return this.http.post(environment.eventsUrl, event);
  }

  getVenues(event_id) {
    return this.http.get(environment.venuesUrl, event_id)
  }

  addVenue(venue) {
    console.log(JSON.stringify(venue))
    return this.http.put(environment.venuesUrl, JSON.stringify(venue))
  }

}
