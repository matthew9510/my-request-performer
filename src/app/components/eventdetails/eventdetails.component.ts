import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eventdetails',
  templateUrl: './eventdetails.component.html',
  styleUrls: ['./eventdetails.component.scss']
})
export class EventdetailsComponent implements OnInit {

  event: object = {
    date: 'MAR 10',
    title: 'Valentines Day: Bash!',
    venue: 'The Shout! House',
    id: '10'
  };

  constructor() { }

  ngOnInit() {
  }


  editEvent(id) {
    alert(`Redirecting to manage event for event with the ID of ${id} `)
  }

}
