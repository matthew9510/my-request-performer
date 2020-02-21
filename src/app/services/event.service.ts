import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '@ENV'

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
   
  constructor(private http: HttpClient) {
   }

  getEvents() {
    return this.http.get<Events[]>('../assets/events.json');
  }

  createEvent(event) {
    return this.http.post(environment.eventUrl, event);
  }

}
