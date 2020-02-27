import { Injectable } from '@angular/core';
import { Requests } from '../interfaces/requests';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  pendingRequests: Requests[];
  acceptedRequests: Requests[];

  constructor(
    private http: HttpClient
  ) { }

  fetchPendingRequests() {
    return this.http.get<Requests[]>('../assets/requests/pendingRequests.json');
  }

  fetchAcceptedRequests() {
    return this.http.get<Requests[]>('../assets/requests/acceptedRequests.json')
  }

  // not finished yet - waiting on backend set up

  // isolate the specific request by a route that filters by request ID, then patch with the updated status
  patchRequestStatus(body, requestId) {
    return this.http.patch("../assets/requests/pendingRequests.json", body)
  }

  onFetchRequests() {
    this.fetchPendingRequests()
      .subscribe((res: Requests[]) => {
        this.pendingRequests = res;
      });
    this.fetchAcceptedRequests()
      .subscribe((res: Requests[]) => this.acceptedRequests = res);
  }

}