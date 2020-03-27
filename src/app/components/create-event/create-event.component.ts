import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import * as moment from 'moment';
import { EventService } from 'src/app/services/event.service';
import { PerformerService } from '@services/performer.service';
import { Router } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';
import { VenueService } from '@services/venue.service'

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
  editEvent = false;
  eventToClone;
  venueToClone;
  uploadImage = false; // hide uploading image for now
  venues: any[] = [];

  constructor(private fb: FormBuilder,
    private eventService: EventService,
    private performerService: PerformerService,
    private router: Router,
    private venueService: VenueService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.editEvent = true
      this.eventToClone = this.router.getCurrentNavigation().extras.state.event;
      this.venueToClone = this.router.getCurrentNavigation().extras.state.venue;
    }
  }

  ngOnInit() {
    this.eventDetailForm = this.fb.group({
      title: [null, Validators.required],
      description: [null, Validators.required],
      coverFee: [null],
      genre: [null, Validators.required],
      url: [null],
      status: ["created"],
      performerId: [localStorage.getItem('performerSub')],
      venueId: [null],
      // image: [null],
    })

    this.eventTimeAndDateForm = this.fb.group({
      date: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
    })

    // Take away selecting previous venues for now
    this.venueForm = this.fb.group({
      id: [null, Validators.required],
    })

    if (this.editEvent === true) {
      this.eventDetailForm.patchValue(this.eventToClone);
      this.eventTimeAndDateForm.patchValue(this.eventToClone);
      this.venueForm.patchValue(this.eventToClone);

      // Set Date to correct format for mat-datepicker
      this.eventTimeAndDateForm.controls.date.setValue(new Date(this.eventToClone.date));
    }
    else {
      this.displayAddVenue();
    }

  }

  // make sure a person auto-completes with one of their venues
  // venueValidator(control: AbstractControl): { [key: string]: boolean } | null {
  //   if (control.touched) {
  //     return { 'venueError': true }
  //   }
  //   return null
  // }

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
      performerId: [localStorage.getItem('performerSub')]
    });
  }

  prepareEvent(venueId) {
    if (!this.editEvent) { // if creating a new event
      // Reassign date with desired format
      this.eventTimeAndDateForm.value.date = String(this.eventTimeAndDateForm.value.date._i.year) + '-' + String(this.eventTimeAndDateForm.value.date._i.month + 1) + '-' + String(this.eventTimeAndDateForm.value.date._i.date)
      // concatenate all forms together 
      let newEvent = new Object();
      Object.assign(newEvent, this.eventDetailForm.value, { venueId: venueId }, this.eventTimeAndDateForm.value);
      return newEvent;
    }
    else { // if editing the event 
      // concatenate all forms together 
      let newEvent = this.eventToClone
      Object.assign(newEvent, this.eventDetailForm.value, this.eventTimeAndDateForm.value)
      // convert date to the correct format 
      newEvent.date = new Date(newEvent.date)
      newEvent.date = String(newEvent.date.getFullYear()) + "-" + String(newEvent.date.getMonth() + 1) + "-" + String(newEvent.date.getDate())
      // return concatenated object 
      return newEvent
    }
  }


  // add upload image later
  createEvent() {
    if (this.addingVenue) {
      // Create entry in venue table
      this.venueService.addVenue(this.venueForm.value).subscribe((res: any) => {
        let venueId = res.record.id;

        // create a event object
        let event = this.prepareEvent(venueId)

        // create entry in event table 
        this.eventService.createEvent(event).subscribe((res) => {
          // redirect to events
          this.router.navigate(['/events'])
        }, (err) => {
          console.error("Couldn't create event", err)
        })
      }, (err) => {
        console.error("Couldn't create venue", err)
      })
    }
    else {
      // you don't have to addVenue, just append the venue_id
    }
  }

  updateEvent() {
    // create a event object
    let event = this.prepareEvent(this.venueToClone.id)

    // edit entry in event table 
    this.eventService.editEvent(event).subscribe((res) => {
      // redirect to events
      this.router.navigate(['/events'])
    }, (err) => {
      console.error("Couldn't create event", err)
    })
  }

  // imageUploaded(image) {
  //   console.log(image.target)
  //   console.log(image.target.files[0])
  // }

}
