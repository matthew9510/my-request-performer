import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformerService {

  performerid: string
  
  constructor() {
    this.performerid = "123"
  }
}
