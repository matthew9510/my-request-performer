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
  isSignedUp: boolean = false;
  showEventsSnackBar: boolean = true;

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
    // let authState = res.authState;

    if (performer.statusCode === 200) {
      this.performer = performer.body.Item;

      // Set variables for potential on-boarding process
      this.isSignedUp = true;
      this.showEventsSnackBar = false;

      this.router.navigate(["/dashboard"]);
    } else {
      this.router.navigate(["/profile"]);
    }
  }

  fetchPerformer() {
    // this will set up flags so when users refresh page then the logic is correct
    return this.getPerformerInfoById(localStorage.getItem("performerSub"));
  }
}
