import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@ENV";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class EventService {
  currentEvent = null;
  currentEventId: string;
  // remembers the last filter applied to manage events drop down menu
  lastSearchStatus: string = "created";

  constructor(private http: HttpClient, private authService: AuthService) {}

  // gets all events (all statuses) for the performer that is currently logged in
  getEvents() {
    const headers = {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem("performerJwt"),
      }),
    };
    return this.http.get(
      `${environment.performersUrl}/${localStorage.getItem(
        "performerSub"
      )}/events`,
      headers
    );
  }

  createEvent(event: Object) {
    return this.http.post(`${environment.eventsUrl}`, event);
  }

  editEvent(event: any) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem("performerJwt"),
      }),
    };
    return this.http.put(
      `${environment.eventsUrl}/${event.id}`,
      event,
      headers
    );
  }

  getVenues(event_id: any) {
    return this.http.get(environment.venuesUrl, event_id);
  }

  addVenue(venue: any) {
    return this.http.put(environment.venuesUrl, venue);
  }

  getEvent(eventId: string) {
    return this.http.get(`${environment.eventsUrl}/${eventId}`);
  }

  updateEvent(eventId: any, event: any) {
    return this.http.put(`${environment.eventsUrl}/${eventId}`, event);
  }

  startEvent() {
    this.currentEvent.status = "active";
    return this.updateEvent(this.currentEvent.id, this.currentEvent);
  }

  pauseEvent() {
    this.currentEvent.status = "paused";
    return this.updateEvent(this.currentEvent.id, this.currentEvent);
  }

  cancelEvent(eventId: string, event: any) {
    this.updateEvent(eventId, event).subscribe(
      (res) => res,
      (err) => err
    );
  }

  endEvent() {
    this.currentEvent.status = "completed";
    return this.updateEvent(this.currentEvent.id, this.currentEvent);
  }
}
