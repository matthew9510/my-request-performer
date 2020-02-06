import { Injectable } from '@angular/core';
import { Requests } from '../interfaces/requests';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PayoutService {

  constructor(private http: HttpClient) { }

  fetchRequestInfo() {
    return this.http.get<Requests[]>('../assets/requests/acceptedRequests.json')
  }
}
