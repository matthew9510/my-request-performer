import { Injectable } from "@angular/core";
import { Requests } from "../interfaces/requests";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RequestsService {
  constructor(private http: HttpClient) {}

  getRequestsByEventId(eventId: string, status: string) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem("performerJwt"),
      }),
    };
    return this.http.get(
      `${environment.eventsUrl}/${eventId}/requests/?status=${status}`,
      headers
    );
  }

  getAllRequestsByEventId(eventId: string) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem("performerJwt"),
      }),
    };
    return this.http.get(
      `${environment.eventsUrl}/${eventId}/requests`,
      headers
    );
  }

  changeRequestStatus(request, requestId: string | number) {
    return this.http.put(`${environment.requestsUrl}/${requestId}`, request);
  }

  getAllRequestsByPerformerId(performerId: string, status: string) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem("performerJwt"),
      }),
    };
    return this.http.get(
      `${environment.performersUrl}/${performerId}/requests?status=${status}`,
      headers
    );
  }
}
