import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-add-venue',
  templateUrl: './add-venue.component.html',
  styleUrls: ['./add-venue.component.scss']
})
export class AddVenueComponent implements OnInit {
  venues: any[] = [
    { name: 'Shout! House', location: 'San Diego' },
    { name: 'Omnia', location: 'San Diego' },
    { name: 'Seville', location: 'Pensacola' },
    { name: 'Add New Venue', icon: 'add' }
  ];
  countries: any[] = [
    { name: 'USA' },
    { name: 'Canada' },
    { name: 'Mexico' },
    { name: 'U.K.' },
    { name: 'Spain' },
  ];

  states: any[] = [
    { name: 'Alabama' }, { name: 'Alaska' }, { name: 'Arizona' }, { name: 'Arkansas' }, { name: 'California' },
    { name: 'Colorado' }, { name: 'Connecticut' }, { name: 'Delaware' }, { name: 'District of Columbia' }, { name: 'Florida' }, { name: 'Georgia' },
    { name: 'Hawaii' }, { name: 'Idaho' }, { name: 'Illinois' }, { name: 'Indiana' }, { name: 'Iowa' },
    { name: 'Kansas' }, { name: 'Kentucky' }, { name: 'Louisiana' }, { name: 'Maine' }, { name: 'Maryland' },
    { name: 'Massachusetts' }, { name: 'Michigan' }, { name: 'Minnesota' }, { name: 'Mississippi' }, { name: 'Missouri' },
    { name: 'Montana' }, { name: 'Nebraska' }, { name: 'Nevada' }, { name: 'New Hampshire' }, { name: 'New Jersey' },
    { name: 'New Mexico' }, { name: 'New York' }, { name: 'North Carolina' }, { name: 'North Dakota' }, { name: 'Ohio' },
    { name: 'Oklahoma' }, { name: 'Oregon' }, { name: 'Pennsylvania' }, { name: 'Rhode Island' }, { name: 'South Carolina' },
    { name: 'South Dakota' }, { name: 'Tennessee' }, { name: 'Texas' }, { name: 'Utah' }, { name: 'Vermont' },
    { name: 'Virginia' }, { name: 'Washington' }, { name: 'West Virginia' }, { name: 'Wisconsin' }, { name: 'Wyoming' },
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

  onSubmit() { }

}
