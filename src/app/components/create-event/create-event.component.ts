import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
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
import { Location } from "@angular/common";
import * as moment from "moment";

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
  editEvent = false;
  eventToClone;
  venueToClone;
  uploadImage = false; // hide uploading image for now
  venues: any[] = [];
  // applies property to disable past dates on datepicker
  today: Date;
  startTime: any;
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
  // @ViewChild("input1", { static: false }) input1: ElementRef;
  // @ViewChild("input2", { static: false }) input2: ElementRef;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private performerService: PerformerService,
    private router: Router,
    private venueService: VenueService,
    private location: Location
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.editEvent = true;
      this.eventToClone = this.router.getCurrentNavigation().extras.state.event;
      this.venueToClone = this.router.getCurrentNavigation().extras.state.venue;
    }
    this.today = new Date();
  }

  ngAfterViewInit(): void {
    // initialize to assist setting autofocus on inputs
    this.autoFocusElements = {
      input0: this.input0,
      // input1: this.input1,
      // input2: this.input2,
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
      startTime: [null],
      endTime: [null],
    });

    this.eventTimeAndDateForm.valueChanges.subscribe((x) => {
      /** when a start time is entered, the end time changes to one value
          greater than the start time**/
      if (
        this.eventTimeAndDateForm.value.endTime === null &&
        this.eventTimeAndDateForm.value.startTime !== null
      ) {
        let index = this.times.indexOf(x.startTime);
        this.eventTimeAndDateForm.controls.endTime.setValue(
          this.times[index + 1]
        );
      }

      /** Alter the time on the date object to the start time of the date object
          make sure the date has been created before doing this logic **/
      if (
        this.eventTimeAndDateForm.value.startTime !== null &&
        this.eventTimeAndDateForm.value.date !== null
      ) {
        if (this.editEvent === true) {
          // Reshape the data coming back from database
          if (!(this.eventTimeAndDateForm.value.date instanceof moment)) {
            // Transform date
            let tempDate = moment(this.eventTimeAndDateForm.value.date);
            this.eventTimeAndDateForm.controls.date.setValue(tempDate);
          }
        }

        // transformation of date to match start time
        let isAm =
          this.eventTimeAndDateForm.value.startTime.split(" ")[1] === "AM";
        let parsedStartTime = this.eventTimeAndDateForm.value.startTime.split(
          ":"
        )[0];

        // Convert to 24 hour time for the database
        if (isAm === true && parsedStartTime === "12") {
          this.eventTimeAndDateForm.value.date._d.setHours(0);
        } else if (isAm === true) {
          this.eventTimeAndDateForm.value.date._d.setHours(parsedStartTime);
        } else if (isAm === false && parsedStartTime === "12") {
          this.eventTimeAndDateForm.value.date._d.setHours(parsedStartTime);
        } else {
          let newHour = Number(parsedStartTime) + 12;
          this.eventTimeAndDateForm.value.date._d.setHours(newHour);
        }
      }
    });

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

    if (this.editEvent === true) {
      this.eventDetailForm.patchValue(this.eventToClone);
      this.eventTimeAndDateForm.patchValue(this.eventToClone);
      this.venueForm.patchValue(this.venueToClone);

      // Set Date to correct format for mat-datepicker
      this.eventTimeAndDateForm.controls.date.setValue(
        new Date(this.eventToClone.date)
      );
    }
  }

  /* These two methods below set autofocus on the first input of each step of the stepper */
  setFocus() {
    // assign the target element accordingly
    if (this.targetId === "input0") {
      // target appropriate viewchild using targetId
      let targetElem = this.autoFocusElements[this.targetId];
      // set focus on the element
      targetElem.nativeElement.focus();
    }
  }

  prepareEvent(venueId: any) {
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
    // Create entry in venue table
    this.venueService.addVenue(this.venueForm.value).subscribe(
      (res: any) => {
        console.log(res);

        let venueId = res.record.id;

        // create a event object
        let event = this.prepareEvent(venueId);

        // create entry in event table
        this.eventService.createEvent(event).subscribe(
          (res: any) => {
            console.log(res);
            this.performerService.eventCreatedSnackbar = true;
            this.performerService.eventCreatedMessage =
              "Success! Your event was created.";
            // redirect to event overview for the new event
            this.router.navigate([`/event-overview/${res.record.id}`]);
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
  }

  updateEvent() {
    // need to resubmit the venue
    // only do this if edited
    let venueId = this.eventToClone.venueId;
    if (this.isEdited()) {
      this.venueForm.value.id = venueId;
      this.venueService
        .updateVenue(this.venueForm.value)
        .subscribe((res: any) => {
          // create a event object
          let event = this.prepareEvent(venueId);
          // edit entry in event table
          this.eventService.editEvent(event).subscribe(
            (res: any) => {
              this.performerService.eventCreatedSnackbar = true;
              this.performerService.eventCreatedMessage =
                "Success! Your event was changed.";
              // redirect to event overview for the new event
              this.router.navigate([`/event-overview/${res.response.id}`]);
            },
            (err) => {
              console.error("Couldn't create event", err);
            }
          );
        });
    } else {
      // create a event object
      let event = this.prepareEvent(venueId);
      // edit entry in event table
      this.eventService.editEvent(event).subscribe(
        (res: any) => {
          console.log(res);
          this.performerService.eventCreatedSnackbar = true;
          this.performerService.eventCreatedMessage =
            "Success! Your event was changed.";
          // redirect to event overview for the new event
          this.router.navigate([`/event-overview/${res.response.id}`]);
        },
        (err: any) => {
          console.error("Couldn't create event", err);
        }
      );
    }
  }

  // Helper function to see if venue is updated
  isEdited() {
    // returns true if the form has been altered
    let isAltered = false;
    let venueFieldNames = Object.keys(this.venueForm.value);

    for (let key of venueFieldNames) {
      if (this.venueForm.value[key] !== this.venueToClone[key])
        isAltered = true;
    }

    return isAltered;
  }

  cancelUpdateEvent() {
    this.location.back();
  }

  // imageUploaded(image) {
  //   console.log(image.target)
  //   console.log(image.target.files[0])
  // }
}
