import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class PerformerService {
  headers = {
    headers: new HttpHeaders({
      Authorization: localStorage.getItem("performerJwt"),
    }),
  };
  performerid: string;

  constructor(private http: HttpClient) {}

  getPerformerInfoById(performerId: string) {
    return this.http.get(
      `${environment.performersUrl}/${performerId}`,
      this.headers
    );
  }
}
