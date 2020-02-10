import { Injectable } from '@angular/core';
import { Requests } from '../interfaces/requests';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PayoutService {

  private _url: string = '../assets/requests/acceptedRequests.json';

  constructor(private http: HttpClient) { }

  fetchRequestInfo() {
    return this.http.get<Requests[]>(this._url)
  }
}
