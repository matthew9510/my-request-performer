import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

export interface Time {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  times: Time[] = [
    {value: 'one-0', viewValue: 'zero'},
    {value: 'two-1', viewValue: 'one'},
    {value: 'three-2', viewValue: 'two'},
    {value: 'four-3', viewValue: 'three'},
    {value: 'five-4', viewValue: 'four'},
    {value: 'seven-6', viewValue: 'five'}
  ];

  // times = [];

  // constructor() {
  //   // populate new list of times
  //     this.createTimesWithOutReturn(); // if it doesn't return anything

  //     this.times = this.createTimesWithReturn(); // if it does return something

  // }

  ngOnInit() {
    console.log(moment().format());
  }

  // createTimesWithOutReturn(){
  //   for(){
  //     this.times.push()
  //   }
  //   // don't return
  //   return void
  // }

  // createTimesWithReturn(){
  //   let tempArray = []
  //   for (){
  //     tempArray.push()
  //   }
  //   // don't return
  //   return tempArray
}


