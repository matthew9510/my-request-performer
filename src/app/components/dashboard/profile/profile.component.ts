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
import { concatMap, retry } from "rxjs/operators";
import { HttpParams } from "@angular/common/http";
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";
import { GenericErrorModalComponent } from "../../generic-error-modal/generic-error-modal.component";
import { MatDialog } from "@angular/material/dialog";

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
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
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

          // Handling of stripe redirecting if performer hasn't signed up yet
          if (
            this.stripeState === this.performerService.performer.state &&
            !this.performerService.isStripeAccountLinked
          ) {
            // show spinner stating link of stripe accounts in progress
            this.stripeLinkInProgress = true;

            let performerId = localStorage.getItem("performerSub");
            let performerState = this.performerService.performer.state;

            if (this.stripeError === null) {
              this.stripeService
                .linkStripeAccounts(
                  this.stripeState,
                  this.stripeAuthCode,
                  performerId,
                  performerState
                )
                .subscribe((res: any) => {
                  // Update performer
                  this.performerService.performer = res.performer;

                  // Update app flags
                  this.performerService.isStripeAccountLinked = true;

                  // Stop spinner and present a message saying stripe account setup
                  this.stripeLinkInProgress = false;
                  this.stripeLinkComplete = true;
                });
            } else {
              this.stripeLinkInProgress = false;
            }
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

          let redirectUrl =
            window.location.protocol + "//" + window.location.host + "/profile";

          // Prepare stripe redirect link
          let params = new HttpParams();
          params = params.append("scope", "read_write");
          params = params.append("response_type", "code");
          params = params.append("client_id", environment.stripeClient);
          params = params.append("state", performer.state);
          params = params.append("redirect_uri", redirectUrl);
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
            "stripe_user[business_name]",
            "My Request Performer"
          );
          params = params.append("stripe_user[physical_product]", "false");
          params = params.append(
            "stripe_user[product_description]",
            "My Request"
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

  unlinkPerformerFromStripe() {
    // Prompt performer to confirm
    const title = "Warning";
    const message =
      "Are you sure you want to disconnect your Stripe account from the My Request platform?";
    const action = "Disconnect Stripe";
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "300px",
      autoFocus: false,
      data: {
        title,
        message,
        action,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // If performer confirms
      if (result) {
        // Prepare payload to remove performer stripe link from My Request Platform
        let performer: any = {};
        Object.assign(performer, this.performerService.performer);
        let payload = {
          performerId: performer.id,
          clientId: environment.stripeClient,
        };

        this.stripeService
          .removePerformerStripeLink(performer.stripeId, payload)
          .pipe(retry(1))
          .subscribe(
            (res: any) => {
              if (res.statusCode === 200) {
                // Reset component and service values to signify performer isn't
                // linked with My Request stripe account anymore
                this.performerService.performer = res.performer;
                this.performerService.isStripeAccountLinked = false;
                this.stripeLinkComplete = false;
              }
            },
            (err) => {
              // If error show modal to send email to customer support
              console.log(err);

              // Set up values of error modal component
              let modalData: any = {
                errorMessage:
                  "There was a problem with disconnecting your Stripe account from the My Request platform.",
              };
              if (performer.firstName && performer.lastName) {
                modalData.hrefValue =
                  "mailto: myrequest-beta@softstackfactory.com?subject=Problem with Performer Unlinking their Stripe Account from the My Request Platform&body=Performer, " +
                  performer.firstName +
                  " " +
                  performer.lastName +
                  ", is not able to disconnect their Stripe account from the My request Platform and is requesting assistance. %0D%0A%0D%0APerformer Details:%0D%0APerformer Id: " +
                  performer.id +
                  "%0D%0APerformer Stripe Id: " +
                  performer.stripeId +
                  "%0D%0APerformer Email: " +
                  this.authService.performerAuthState.user.attributes.email;
              } else {
                modalData.hrefValue =
                  "mailto: myrequest-beta@softstackfactory.com?subject=Problem with Performer Unlinking their Stripe Account from the My Request Platform&body=A Performer is not able to disconnect their Stripe account from the My request Platform and is requesting assistance. %0D%0A%0D%0APerformer Details:%0D%0APerformer Id: " +
                  performer.id +
                  "%0D%0APerformer Stripe Id: " +
                  performer.stripeId +
                  "%0D%0APerformer Email: " +
                  this.authService.performerAuthState.user.attributes.email;
              }
              // open modal to present error
              this.dialog.open(GenericErrorModalComponent, {
                width: "300px",
                autoFocus: false,
                data: modalData,
              });
            }
          );
      }
    });
  }

  removePerformerPersonalInfoFromDb() {
    let performer: any = {};
    Object.assign(performer, this.performerService.performer);
    performer.firstName = "Account deleted";
    performer.lastName = "Account deleted";
    performer.bio = "Account deleted";
    performer.email = "Account deleted";
    performer.endEventMessage = "Account deleted";
    performer.instrumentOfChoice = "Account deleted";
    performer.phone = "Account deleted";

    this.performerService.updatePerformer(performer.id, performer).subscribe(
      (res: any) => {
        console.log(res);
        // update performer
        this.performerService.performer = res.response;

        // Reset form to display view
        this.profileForm.patchValue(this.performerService.performer);

        let message = "Personal data deleted successfully";
        let snackBarRef = this._snackBar.open(message, "Dismiss", {
          duration: 3000,
          verticalPosition: "top",
        });

        snackBarRef.afterDismissed().subscribe(() => {
          // delete their cognito info
          this.deleteCognitoAccount();
        });
      },
      (err) => {
        console.log(err);

        // Refer back to original unmodified performer values
        let performer = this.performerService.performer;
        // Set up values of error modal component
        let modalData: any = {
          errorMessage:
            "There was a problem with removing your personal data from the My Request platform.",
          hrefValue:
            "mailto: myrequest-beta@softstackfactory.com?subject=Problem Deleting Personal Data from the My Request Platform&body=Performer, " +
            performer.firstName +
            " " +
            performer.lastName +
            ", is not able to remove their personal data from the My request Platform and is requesting assistance. %0D%0A%0D%0APerformer Details:%0D%0APerformer Id: " +
            performer.id +
            "%0D%0APerformer Email: " +
            this.authService.performerAuthState.user.attributes.email,
        };

        // open modal to present error
        this.dialog.open(GenericErrorModalComponent, {
          width: "300px",
          autoFocus: false,
          data: modalData,
        });
      }
    );
  }

  deleteCognitoAccount() {
    this.authService.deleteAccountFromCognito().subscribe(
      (res) => {
        let message =
          "My Request account deleted successfully. Signing you out and redirecting you to the login page.";
        let snackBarRef = this._snackBar.open(message, "Dismiss", {
          duration: 5000,
          verticalPosition: "top",
        });

        snackBarRef.afterDismissed().subscribe(() => {
          //  Log out
          this.authService.logout();
        });
      },
      (err) => {
        console.log(err);

        // Refer back to original unmodified performer values
        let performer = this.performerService.performer;
        // Set up values of error modal component
        let modalData: any = {
          errorMessage:
            "There was a problem with deleting your account from the My Request platform.",
          hrefValue:
            "mailto: myrequest-beta@softstackfactory.com?subject=Problem Deleting Performer from the My Request Platform&body=A Performer is not able to delete their account from the My request Platform and is requesting assistance. %0D%0A%0D%0APerformer Details:%0D%0APerformer Id: " +
            localStorage.getItem("performerSub") +
            "%0D%0APerformer Email: " +
            this.authService.performerAuthState.user.attributes.email,
        };

        // open modal to present error
        this.dialog.open(GenericErrorModalComponent, {
          width: "300px",
          autoFocus: false,
          data: modalData,
        });
      }
    );
  }

  deletePerformer() {
    // Make sure that stripe is unlinked first
    if (this.performerService.isStripeAccountLinked) {
      // Show a modal to direct performer to disconnect their Stripe account
      // with the My Request platform Stripe account first
      const title = "Before Deleting Account";
      const message =
        "You must disconnect your Stripe account before you can delete your account.";
      const action = "Disconnect Stripe";
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: "300px",
        autoFocus: false,
        data: {
          title,
          message,
          action,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        // If performer confirms
        if (result) {
          this.unlinkPerformerFromStripe();
        }
      });
    } else {
      // Prompt performer to confirm they want to delete account if they don't have a
      // linked stripe account to the My Request Platform
      const title = "Warning";
      const message =
        "Are you sure you want to delete your My Request platform account?";
      const action = "Delete Account";
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: "300px",
        autoFocus: false,
        data: {
          title,
          message,
          action,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        // If performer confirms
        if (result) {
          // if the performer has saved any personal data with our db
          if (this.performerService.isSignedUp) {
            // remove performer personal data from db
            // this method will also delete the cognito account
            this.removePerformerPersonalInfoFromDb();
          } else {
            // delete their cognito info
            this.deleteCognitoAccount();
          }
        }
      });
    }
  }
}
