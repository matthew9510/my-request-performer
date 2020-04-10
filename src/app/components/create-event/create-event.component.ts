import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { EventService } from "src/app/services/event.service";
import { PerformerService } from "@services/performer.service";
import { Router } from "@angular/router";
import { ThrowStmt } from "@angular/compiler";
import { VenueService } from "@services/venue.service";

@Component({
  selector: "app-create-event",
  templateUrl: "./create-event.component.html",
  styleUrls: ["./create-event.component.scss"],
})
export class CreateEventComponent implements OnInit, AfterViewInit {
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

  // times for start and end time dropdowns
  times = [
    "12:00 AM",
    "1:00 AM",
    "2:00 AM",
    "3:00 AM",
    "4:00 AM",
    "5:00 AM",
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
    "11:00 PM",
  ];

  // for setting autofocus on inputs
  private targetId = "input0";
  private autoFocusElements: any;
  @ViewChild("input0", { static: false }) input0: ElementRef;
  @ViewChild("input1", { static: false }) input1: ElementRef;
  @ViewChild("input2", { static: false }) input2: ElementRef;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private performerService: PerformerService,
    private router: Router,
    private venueService: VenueService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.editEvent = true;
      this.eventToClone = this.router.getCurrentNavigation().extras.state.event;
      this.venueToClone = this.router.getCurrentNavigation().extras.state.venue;
    }
  }
  ngAfterViewInit(): void {
    // initialize to assist setting autofocus on inputs
    this.autoFocusElements = {
      input0: this.input0,
      input1: this.input1,
      input2: this.input2,
    };
  }

  ngOnInit() {
    this.eventDetailForm = this.fb.group({
      title: [null, [Validators.required]],
      description: [null],
      coverFee: [null],
      genre: [null],
      url: [null],
      status: ["created"],
      performerId: [localStorage.getItem("performerSub")],
      venueId: [null],
      // image: [null],
    });

    this.eventTimeAndDateForm = this.fb.group({
      date: [null, [Validators.required]],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
    });

    // when a start time is entered, the end time changes to one value greater than the start time
    this.eventTimeAndDateForm.valueChanges.subscribe((x) => {
      if (
        this.eventTimeAndDateForm.value.endTime === null &&
        this.eventTimeAndDateForm.value.startTime !== null
      ) {
        let index = this.times.indexOf(x.startTime);
        this.eventTimeAndDateForm.controls.endTime.setValue(
          this.times[index + 1]
        );
      }
    });

    // Take away selecting previous venues for now
    this.venueForm = this.fb.group({
      id: [null, Validators.required],
    });

    if (this.editEvent === true) {
      this.eventDetailForm.patchValue(this.eventToClone);
      this.eventTimeAndDateForm.patchValue(this.eventToClone);
      this.venueForm.patchValue(this.eventToClone);

      // Set Date to correct format for mat-datepicker
      this.eventTimeAndDateForm.controls.date.setValue(
        new Date(this.eventToClone.date)
      );
    } else {
      this.displayAddVenue();
    }
  }

  /* These two methods below set autofocus on the first input of each step of the stepper */
  setFocus() {
    // assign the target element accordingly
    let targetElem = this.autoFocusElements[this.targetId]; // target appropriate viewchild using targetId

    // set focus on the element
    targetElem.nativeElement.focus();
  }

  // Subscription to mat-vertical-stepper when it switches steps
  setTargetId(event: any) {
    this.targetId = `input${event.selectedIndex}`;
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
      streetAddress: [null],
      city: [null],
      state: [null],
      postalCode: [null],
      country: [null],
      url: [null],
      performerId: [localStorage.getItem("performerSub")],
    });
  }

  prepareEvent(venueId) {
    if (!this.editEvent) {
      // if creating a new event
      // concatenate all forms together
      let newEvent = new Object();
      Object.assign(
        newEvent,
        this.eventDetailForm.value,
        { venueId: venueId },
        this.eventTimeAndDateForm.value
      );
      return newEvent;
    } else {
      // if editing the event
      // concatenate all forms together
      let newEvent = this.eventToClone;
      Object.assign(
        newEvent,
        this.eventDetailForm.value,
        this.eventTimeAndDateForm.value
      ); // Need to add venue changes later
      // return concatenated object
      return newEvent;
    }
  }

  // add upload image later
  createEvent() {
    if (this.addingVenue) {
      // Create entry in venue table
      this.venueService.addVenue(this.venueForm.value).subscribe(
        (res: any) => {
          let venueId = res.record.id;

          // create a event object
          let event = this.prepareEvent(venueId);

          // create entry in event table
          this.eventService.createEvent(event).subscribe(
            (res) => {
              // redirect to events
              this.router.navigate(["/events"]);
            },
            (err) => {
              console.error("Couldn't create event", err);
            }
          );
        },
        (err) => {
          console.error("Couldn't create venue", err);
        }
      );
    } else {
      // you don't have to addVenue, just append the venue_id
    }
  }

  updateEvent() {
    // create a event object
    let event = this.prepareEvent(this.venueToClone.id);

    // edit entry in event table
    this.eventService.editEvent(event).subscribe(
      (res) => {
        // redirect to events
        this.router.navigate(["/events"]);
      },
      (err) => {
        console.error("Couldn't create event", err);
      }
    );
  }

  cancelUpdateEvent() {
    this.router.navigate(["/events"]);
  }

  // imageUploaded(image) {
  //   console.log(image.target)
  //   console.log(image.target.files[0])
  // }
}
