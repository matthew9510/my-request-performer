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

}
