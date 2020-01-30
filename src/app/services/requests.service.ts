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

  fetchRequests() {
    return this.http.get<Requests[]>('../assets/requests/requests.json');
  }

}
