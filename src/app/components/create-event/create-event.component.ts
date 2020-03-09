import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import * as moment from 'moment';
import { EventService } from 'src/app/services/event.service';
import { PerformerService } from '@services/performer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  eventDetailForm: FormGroup;
  venueForm: FormGroup;
  eventForm: FormGroup;
  eventTimeAndDateForm: FormGroup;
  addingVenue = false;
  eventToClone;

  constructor(private fb: FormBuilder,
    private eventService: EventService,
    private performerService: PerformerService,
    private router: Router
  ) {
    this.eventToClone = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    // this.eventDetailForm = this.fb.group({
    //   title: [null, Validators.required],
    //   description: [null, Validators.required],
    //   coverFee: [null],
    //   genre: [null, Validators.required],
    //   url: [null],
    //   image: [null],
    // })
    this.eventDetailForm = this.fb.group({
      title: [null, Validators.required],
      description: [null, Validators.required],
      coverFee: [null],
      genre: [null, Validators.required],
      url: [null],
      image: [null],
      status: ["Lit"],
      performer_id: ["08cdaf46-a954-4c39-8f84-88e3d6b02551"],
      venue_id: ["d7cfa70b-8684-43ac-b72e-7005dcf27202"],
    })
    this.eventTimeAndDateForm = this.fb.group({
      date: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
    })

    this.venueForm = this.fb.group({
      id: [null, Validators.required, this.venueValidator],
    })
  }

  venueValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.touched) {
      return { 'venueError': true }
    }

    return null
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

    if (this.eventToClone !== undefined) {
      this.eventForm.patchValue(this.eventToClone);
    }
  }

  renameVenueFormProperties() {
    // function to rename venue properties
    if (this.addingVenue) {
      return {
        name: this.venueForm.get('name').value,
        street_address: this.venueForm.get('streetAddress').value,
        city: this.venueForm.get('city').value,
        state: this.venueForm.get('state').value,
        postal_code: this.venueForm.get('postalCode').value,
        country: this.venueForm.get('country').value,
        url: this.venueForm.get('url').value,
        performer_id: '12345'
      }
    }
    else {
      return { venue_id: this.venueForm.get('id').value }
    }
  }

  renameEventTimeAndDateFormProperties() {
    // function to rename event time and date properties
    return {
      date: this.eventTimeAndDateForm.get('date').value,
      event_start_time: this.eventTimeAndDateForm.get('startTime').value,
      event_endd_time: this.eventTimeAndDateForm.get('endTime').value,
    }
  }

  renameEventFormProperties() {
    // function to rename event properties
    return {
      title: this.eventDetailForm.get('title').value,
      description: this.eventDetailForm.get('description').value,
      coverFee: this.eventDetailForm.get('coverFee').value,
      genre: this.eventDetailForm.get('genre').value,
      url: this.eventDetailForm.get('url').value,
      image: this.eventDetailForm.get('description').value
    }
  }

  prepareEvent() {
    // return {
    //   venue_id: 
    // }
  }

  createEvent() {
    if (this.addingVenue) {
      // make a post to add venue
      let venue = this.renameVenueFormProperties()
      this.eventService.addVenue(venue).subscribe((res: any) => {
        console.log(res)
        let venue_id = res.id
        // upload image 
        // in subscribe link image_cognito path
        // create event 
        // upload event 
        let event = this.prepareEvent()
      }, (err) => {

      })
    }
    else {

    }
  }

  imageUploaded(image) {
    console.log(image.target)
    console.log(image.target.files[0])
  }

}
