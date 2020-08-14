import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PerformerService } from "@services/performer.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { AuthService } from "@services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { translate } from "@ngneat/transloco";
import { environment } from "@ENV";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  editProfile: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    private performerService: PerformerService,
    private authService: AuthService,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Access AWS performer email and phone number details
    let performerAwsData = this.authService.performerAuthState.user.attributes;

    this.profileForm = this.fb.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      email: [performerAwsData.email],
      phone: [performerAwsData.phone_number],
      instrumentOfChoice: [null],
      bio: [null],
      endEventMessage: [null],
    });

    // Update form if the performer already exists in the db
    this.performerService.fetchPerformer().subscribe((res: any) => {
      let performer = res.response;
      if (performer) {
        if (performer.statusCode === 200) {
          // Update performer
          this.performerService.performer = performer.body.Item;

          // fill in form fields
          this.profileForm.patchValue(this.performerService.performer);

          // set form to read only
          this.profileForm.disable();
        }
      }
    });
  }

  get isSmallScreen() {
    return this.breakpointObserver.isMatched("(max-width: 450px)");
  }

  get isLargeScreen() {
    return this.breakpointObserver.isMatched("(min-width: 700px)");
  }

  submit() {
    // Create a performer db entry where the primary key (id) is AWS sub
    let performer = {};
    Object.assign(performer, this.profileForm.value, {
      id: localStorage.getItem("performerSub"),
    });

    this.performerService.createPerformer(performer).subscribe(
      (res: any) => {
        // save the performer
        this.performerService.performer = res.record;
        this.performerService.isSignedUp = true;

        // redirect to events
        this.router.navigate(["/events"]);
      },
      (err) => {
        console.error("Couldn't create event", err);
      }
    );
  }

  // When performer wants to make changes to their profile
  makeEditable() {
    this.profileForm.enable();
    this.editProfile = true;
  }

  // Helper function for appropriately disabling update performer button
  isEdited() {
    // returns true if the form has been altered
    let isAltered = false;
    let profileFormFieldNames = Object.keys(this.profileForm.value);

    for (let key of profileFormFieldNames) {
      if (this.profileForm.value[key] !== this.performerService.performer[key])
        isAltered = true;
    }

    return isAltered;
  }

  updatePerformer() {
    let updatedPerformer: any = {};
    // Properties in the target object are overwritten by properties in the sources if they have the same key. Later sources' properties overwrite earlier ones.
    Object.assign(
      updatedPerformer,
      this.performerService.performer,
      this.profileForm.value
    );

    this.performerService
      .updatePerformer(updatedPerformer.id, updatedPerformer)
      .subscribe((res: any) => {
        // update performer
        this.performerService.performer = res.response;

        // Reset form to display view
        this.editProfile = false;
        this.profileForm.patchValue(this.performerService.performer);
        this.profileForm.disable();

        let message = translate("profile.updateSuccessful");
        let snackBarRef = this._snackBar.open(message, "Dismiss", {
          duration: 3000,
          verticalPosition: "top",
        });

        snackBarRef.afterDismissed().subscribe(() => {
          this.performerService.showEventsSnackBar = false;
        });
      });
  }
}

// Todo:
// only submit form once, on click make disabled
