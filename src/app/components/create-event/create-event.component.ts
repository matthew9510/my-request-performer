import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  eventDetailForm: FormGroup;
  venueForm: FormGroup;
  eventTimeAndDateForm: FormGroup;
  addingVenue = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.eventDetailForm = this.fb.group({
      title: [null, Validators.required],
      coverFee: [null],
      genre: [null, Validators.required],
      description: [null, Validators.required],
      url: [null],
      image: [null],
    })

    this.eventTimeAndDateForm = this.fb.group({
      date: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
    })

    this.venueForm = this.fb.group({
      id: [null, Validators.required],
    })
  }

  displayAddVenue() {
    this.addingVenue = true;
    this.venueForm = this.fb.group({
      name: [null, Validators.required],
      streetAddress: [null, Validators.required],
      city: [null, Validators.required],
      state: [null, Validators.required],
      postalCode: [null, Validators.required],
      country: [null, Validators.required],
      url: [null],
    });
  }

  createEvent() {
    console.log(this.eventDetailForm);
    console.log(this.eventTimeAndDateForm);
    console.log(this.venueForm);
    console.log("Form completed")
  }

  imageUploaded(image) {
    console.log(image.target)
    console.log(image.target.files[0])
  }

}
