import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class StripeService {
  constructor(private http: HttpClient) {}

  createState(performerId: any) {
    return this.http.get(
      `${environment.stripeUrl}/connect/oath/state?debug=true&id=${performerId}`,
      this.createHeaders()
    );
  }

  linkStripeAccounts(stripeState, stripeAuthCode, performerId, performerState) {
    return this.http.get(
      `${environment.stripeUrl}/connect/linkStandardAccount?stripeState=${stripeState}&stripeAuthCode=${stripeAuthCode}&performerId=${performerId}&performerState=${performerState}`,
      this.createHeaders()
    );
  }

  capturePaymentIntent(request) {
    return this.http.post(
      `${environment.stripeUrl}/capturePaymentIntent/`,
      request
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
