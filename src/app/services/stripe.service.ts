import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class StripeService {
  constructor(private http: HttpClient) {}

  createState(performer: any) {
    return this.http.get(
      `${environment.stripeUrl}/connect/oath/state?debug=true`,
      performer
    );
  }

  createHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem("performerJwt"),
      }),
    };
  }
}
