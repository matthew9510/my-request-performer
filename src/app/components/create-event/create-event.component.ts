import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Router, Params } from '@angular/router';


@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  addingVenue = false;
  eventToClone;

  constructor(private router: Router, private params: Params) {
    this.eventToClone = this.router.getCurrentNavigation().extras.state;

  }

  ngOnInit() {
    this.eventForm = new FormBuilder().group({
      title: [null, Validators.required],
      date: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      coverFee: [null],
      genre: [null, Validators.required],
      venue: [null, Validators.required],
      description: [null, Validators.required],
      url: [null],
      image: [null],
    });

    if (this.eventToClone !== undefined) {
      this.eventForm.patchValue(this.eventToClone);
    }


  }

  displayAddVenue() {
    this.addingVenue = true;
    this.eventForm.addControl('newVenue', new FormBuilder().group({
      name: [null, Validators.required],
      streetAddress: [null, Validators.required],
      city: [null, Validators.required],
      state: [null, Validators.required],
      postalCode: [null, Validators.required],
      country: [null, Validators.required],
      url: [null],
    }));
  }

  createEvent() {
    console.log(this.eventForm.value);
    if (this.addingVenue) {
      // do add venue stuff
    }
    // do create even stuff
  }

  imageUploaded(image) {
    console.log(image.target.files[0])
  }

}
