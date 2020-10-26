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
      `${environment.stripeUrl}/connect/oath/state?debug=false&id=${performerId}`,
      this.createHeaders()
    );
  }

  linkStripeAccounts(stripeState, stripeAuthCode, performerId, performerState) {
    return this.http.get(
      `${environment.stripeUrl}/connect/linkStandardAccount?stripeState=${stripeState}&stripeAuthCode=${stripeAuthCode}&performerId=${performerId}&performerState=${performerState}&debug=false`,
      this.createHeaders()
    );
  }

  capturePaymentIntent(request) {
    return this.http.post(
      `${environment.stripeUrl}/capturePaymentIntent?debug=false`,
      request
    );
  }

  cancelPaymentIntent(requestChanges, requestId) {
    return this.http.patch(
      `${environment.stripeUrl}/cancelPaymentIntent/${requestId}?debug=false`,
      requestChanges
    );
  }

  removePerformerStripeLink(performerStripeId, payload) {
    return this.http.patch(
      `${environment.stripeUrl}/unlinkPerformer/${performerStripeId}?debug=false`,
      payload
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
