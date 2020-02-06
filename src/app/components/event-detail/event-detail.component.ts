import {Component, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-eventdetails',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventdetailsComponent implements OnInit {
  @Input() date: string;
  @Input() title: string;
  @Input() venue: string;
  @Input() id: string;


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
