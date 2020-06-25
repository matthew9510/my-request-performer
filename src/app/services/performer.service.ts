import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PerformerService {
  performer: any;
  // isSignedUp lets us know if the performer has filled out their profile & exists on the performers table on the db. Creating event routes are blocked when this is false.
  isSignedUp: boolean = false;
  // changed to true when the performer is linked with stripe and the stripe creds are saved in our db
  isStripeAccountLinked: boolean = false;
  showEventsSnackBar: boolean = true;
  // changed to true when event is created or edited successfully
  eventCreatedSnackbar: boolean = false;
  // success message that is different depending on if its a new event that was created or an existing one that has been edited
  eventCreatedMessage: string;
  // eventEditedMessage: string = "Success! Your event was changed.";
  group: string;
  constructor(private http: HttpClient, private router: Router) {}

  // gets all performers (all statuses)
  getPerformers() {
    return this.http.get(
      `${environment.performersUrl}/performers`,
      this.createHeaders()
    );
  }

  getPerformerInfoById(performerId: string) {
    return this.http.get(
      `${environment.performersUrl}/${performerId}`,
      this.createHeaders()
    );
  }

  createPerformer(performer: Object) {
    return this.http.post(
      environment.performersUrl,
      performer,
      this.createHeaders()
    );
  }

  editPerformer(performer: any) {
    return this.http.put(
      `${environment.performersUrl}/${performer.id}`,
      performer,
      this.createHeaders()
    );
  }

  updatePerformer(performerId: any, performer: any) {
    return this.http.put(
      `${environment.performersUrl}/${performerId}`,
      performer,
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

  storePerformerCreds(res: any) {
    let performer = res.performer.response;
    if (performer) {
      if (performer.statusCode === 200) {
        this.performer = performer.body.Item;

        // Set variables for potential on-boarding process
        this.isSignedUp = true;
        this.showEventsSnackBar = false;

        if (this.performer.stripeId) {
          this.isStripeAccountLinked = true;
        }
      }
    }
  }

  fetchPerformer() {
    // this will set up flags so when users refresh page then the logic is correct
    return this.getPerformerInfoById(localStorage.getItem("performerSub"));
  }
}
