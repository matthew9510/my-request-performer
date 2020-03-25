import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@ENV'
import { AuthService } from '../services/auth.service'

@Injectable({
  providedIn: 'root'
})
export class EventService {
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

  startEvent() {
    this.currentEvent.status = 'active';
    this.updateEvent(this.currentEvent.id, this.currentEvent)
      .subscribe(
        (res) => res,
        (err) => console.log(err));
  }

  pauseEvent() {
    this.currentEvent.status = 'paused';
    this.updateEvent(this.currentEvent.id, this.currentEvent)
      .subscribe(
        (res) => res,
        (err) => console.log(err));
  }

  endEvent() {
    this.currentEvent.status = 'completed';
    this.updateEvent(this.currentEvent.id, this.currentEvent)
      .subscribe(
        (res) => res,
        (err) => console.log(err));
  }

}
