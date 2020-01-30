import { Component, OnInit } from '@angular/core';
import {FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-add-venue',
  templateUrl: './add-venue.component.html',
  styleUrls: ['./add-venue.component.scss']
})
export class AddVenueComponent implements OnInit {
  venues: any[] = [
    {name: 'Shout! House', location: 'San Diego'},
    {name: 'Omnia', location: 'San Diego'},
    {name: 'Seville', location: 'Pensacola'},
    {name: 'Add New Venue', icon: 'add'}
  ];

  venue = this.fb.group({
    name: [''],
    location: this.fb.group({
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: [''],
      website: ['']
    })
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
  }

}
