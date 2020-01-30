import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-events',
  templateUrl: './manage-events.component.html',
  styleUrls: ['./manage-events.component.scss']
})
export class ManageEventsComponent implements OnInit {
  events: any[];

  constructor() {

    this.events = [
      {
      title: 'Valentines Day Bash',
      location: 'The Shout! House',
      date: 'FEB 13'
      },
      {
        title: 'Valentines Day Bash',
        location: 'The Shout! House',
        date: 'FEB 13'
      },
      {
        title: 'Valentines Day Bash',
        location: 'The Shout! House',
        date: 'FEB 13'
      },
      {
        title: 'Valentines Day Bash',
        location: 'The Shout! House',
        date: 'FEB 13'
      },
      {
        title: 'Valentines Day Bash',
        location: 'The Shout! House',
        date: 'FEB 13'
      },
      {
        title: 'Valentines Day Bash',
        location: 'The Shout! House',
        date: 'FEB 13'
      },
      {
        title: 'Valentines Day Bash',
        location: 'The Shout! House',
        date: 'FEB 13'
      }
    ]

  }

  ngOnInit() {
  }



}
