import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';


@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;

  constructor() { }

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
  }

  createEvent() {
    console.log(this.eventForm.value);
  }

  imageUploaded(image) {
    console.log(image.target.files[0])
  }

}
