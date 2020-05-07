import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "@ENV";

@Injectable({
  providedIn: "root",
})
export class VenueService {
  constructor(private http: HttpClient) {}

  getVenue(venueId: any) {
    const headers = {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem("performerJwt"),
      }),
    };
    return this.http.get(`${environment.venuesUrl}/${venueId}`);
  }

  addVenue(venue: any) {
    return this.http.post(environment.venuesUrl, venue);
  }

  updateVenue(venue: any) {
    return this.http.put(environment.venuesUrl, venue);
  }
}
