import { Injectable } from '@angular/core';
import { Requests } from '../interfaces/requests';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  pendingRequests: Requests[];
  acceptedRequests: Requests[];

  constructor(
    private http: HttpClient,
  ) { }

  fetchPendingRequests() {
    return this.http.get<Requests[]>('../assets/requests/pendingRequests.json');
    // return this.http.get(`${environment.requestsUrl}?event_id=ac79fb80-581e-11ea-8831-013de2a009a3`);

  }


  fetchAcceptedRequests() {
    return this.http.get<Requests[]>('../assets/requests/acceptedRequests.json')
  }

  // not finished yet - waiting on backend set up

  // isolate the specific request by a route that filters by request ID, then patch with the updated status
  patchRequestStatus(body: any, requestId: any) {
    return this.http.patch("../assets/requests/pendingRequests.json", body)
  }

  onFetchRequests() {
    this.fetchPendingRequests()
      .subscribe((res: Requests[]) => {
        // console.log(res)
        this.pendingRequests = res;
      }, (err) => {
        console.log(err);
      });
    this.fetchAcceptedRequests()
      .subscribe((res: Requests[]) => this.acceptedRequests = res);
  }


}