import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PerformerService } from "@services/performer.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { AuthService } from "@services/auth.service";
import { StripeService } from "@services/stripe.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { translate } from "@ngneat/transloco";
import { environment } from "@ENV";
import { concatMap } from "rxjs/operators";
import { HttpParams } from "@angular/common/http";
@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  editProfile: boolean = false;
  stripeLinkInProgress: boolean = false;
  stripeLinkComplete: boolean = false;
  stripeState;
  stripeAuthCode;
  stripeError;
  stripeErrorDescription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private performerService: PerformerService,
    private authService: AuthService,
    private stripeService: StripeService,
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

    console.log("this.activatedRoute.snapshot", this.activatedRoute.snapshot);
    // Preparation of stripe redirecting
    this.stripeState = this.activatedRoute.snapshot.queryParamMap.get("state");
    this.stripeAuthCode = this.activatedRoute.snapshot.queryParamMap.get(
      "code"
    );
    this.stripeError = this.activatedRoute.snapshot.queryParamMap.get("error");
    this.stripeErrorDescription = this.activatedRoute.snapshot.queryParamMap.get(
      "error_description"
    );

    // Update form if the performer already exists in the db
    this.performerService.fetchPerformer().subscribe((res: any) => {
      let performer = res.response;
      if (performer) {
        if (performer.statusCode === 200) {
          // Update performer
          this.performerService.performer = performer.body.Item;

          // Set appropriate flags for component
          if (this.performerService.performer.stripeId) {
            this.performerService.isStripeAccountLinked = true;

            // setup showing appropriate html content for this component
            this.stripeLinkComplete = true;
          }
          // fill in form fields
          this.profileForm.patchValue(this.performerService.performer);

          // set form to read only
          this.profileForm.disable();
          console.log("performer", performer);
          console.log(
            "this.performerService.performer ",
            this.performerService.performer
          );
          console.log("this.stripestate", this.stripeState);
          console.log(
            "this.performerService.performer.state",
            this.performerService.performer.state
          );
          console.log(
            "!this.performerService.isStripeAccountLinked",
            !this.performerService.isStripeAccountLinked
          );
          console.log(
            "this.stripeState === this.performerService.performer.state && !this.performerService.isStripeAccountLinked",
            this.stripeState === this.performerService.performer.state &&
              !this.performerService.isStripeAccountLinked
          );

          // Handling of stripe redirecting if performer hasn't signed up yet
          if (
            this.stripeState === this.performerService.performer.state &&
            !this.performerService.isStripeAccountLinked
          ) {
            console.log("inside stripe block to start stripe link");
            // show spinner stating link of stripe accounts in progress
            this.stripeLinkInProgress = true;

            let performerId = localStorage.getItem("performerSub");
            let performerState = this.performerService.performer.state;
            console.log("performerId", performerId);
            console.log("performerState", performerState);

            this.stripeService
              .linkStripeAccounts(
                this.stripeState,
                this.stripeAuthCode,
                performerId,
                performerState
              )
              .subscribe((res: any) => {
                console.log("stripeLink successful Show res", res);
                // Update performer
                this.performerService.performer = res.performer;

                // Update app flags
                this.performerService.isStripeAccountLinked = true;

                // Stop spinner and present a message saying stripe account setup
                this.stripeLinkInProgress = false;
                this.stripeLinkComplete = true;
              });
          }
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

  prepCreationOfPerformer() {
    // Create a performer db entry where the primary key (id) is AWS sub
    let performer = {};
    Object.assign(performer, this.profileForm.value, {
      id: localStorage.getItem("performerSub"),
    });
    return this.performerService.createPerformer(performer);
  }

  submit() {
    this.prepCreationOfPerformer().subscribe(
      (res: any) => {
        // save the performer
        this.performerService.performer = res.record;
        this.performerService.isSignedUp = true;

        // redirect to events
        this.router.navigate(["/events"]);
      },
      (err) => {
        console.error("Couldn't create performer", err);
      }
    );
  }

  triggerStripeOath() {
    //create a performer entry
    this.prepCreationOfPerformer()
      .pipe(
        concatMap((performer: any) => {
          // save the performer in a the performer service
          this.performerService.performer = performer.record;
          this.performerService.isSignedUp = true;

          // Generate a state for stripe onboarding flow
          return this.stripeService.createState(
            this.performerService.performer.id
          );
        })
      )
      .subscribe(
        (res: any) => {
          // update our performer state since it now has a state property
          this.performerService.performer = res.performer;

          // setup local scope variables
          let performer = this.performerService.performer;

          // Prepare stripe redirect link
          let params = new HttpParams();
          params = params.append("scope", "read_write");
          params = params.append("response_type", "code");
          params = params.append("client_id", environment.stripeClient);
          params = params.append("state", performer.state);
          params = params.append(
            "redirect_uri",
            environment.stripeRedirectLink
          );
          params = params.append(
            "stripe_user[first_name]",
            performer.firstName
          );
          params = params.append("stripe_user[last_name]", performer.lastName);
          params = params.append("stripe_user[email]", performer.email);
          params = params.append(
            "stripe_user[phone_number]",
            performer.phone.slice(3)
          );
          params = params.append("stripe_user[country]", "US");
          params = params.append("stripe_user[business_type]", "individual");
          params = params.append(
            "stripe_user[url]",
            "http://www.MyRequest.com"
          );
          params = params.append("stripe_user[physical_product]", "false");
          params = params.append(
            "stripe_user[product_description]",
            "My Request Performer"
          );
          params = params.append("stripe_user[currency]", "usd");

          let redirectLink = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

          // redirect to stripe for onboarding
          this.router.navigate([
            "/externalRedirect",
            {
              externalUrl: redirectLink,
            },
          ]);
        },
        (err) => {
          console.error(
            "Couldn't create stripe state or create a performer",
            err
          );
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
