import { Injectable } from '@angular/core';
import { Requests } from '../interfaces/requests';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(
    private http: HttpClient
  ) { }

  fetchPendingRequests() {
    return this.http.get<Requests[]>('../assets/requests/pendingRequests.json');
  }

  fetchAcceptedRequests() {
    return this.http.get<Requests[]>('../assets/requests/acceptedRequests.json')
  }

}