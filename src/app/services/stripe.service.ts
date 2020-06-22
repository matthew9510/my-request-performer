import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class StripeService {
  constructor(private http: HttpClient) {}

  createState(performerId: any) {
    return this.http.patch(
      `${environment.stripeUrl}/connect/oath/state?debug=true&id=${performerId}`,
      this.createHeaders()
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
