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
import { EndUserLicenseAgreementComponent } from "../../end-user-license-agreement/end-user-license-agreement.component";

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

    // Note auth service will execute code along side this function on page reloads
    // Update form values if the performer already exists in the db
    this.performerService.fetchPerformer().subscribe((res: any) => {
      // if performer has a db entry by signing Eula and maybe also submitting personal info
      if (res.response) {
        // Update performer service values for the app
        this.performerService.performer = res.response.body.Item;
        if (this.performerService.performer.firstName) {
          this.performerService.isSignedUp = true;
        }

        // Assign local storage
        localStorage.setItem("performerSignedEndUserLicenseAgreement", "true");

        // Set appropriate flags for components
        if (this.performerService.performer.stripeId) {
          // Assign values to show appropriate html content for this component
          this.performerService.isStripeAccountLinked = true;
          this.stripeLinkComplete = true;
        }

        // Fill in form fields with performer db and cognito data
        this.profileForm.patchValue(this.performerService.performer);

        // if the performer has filled in the form at least once before
        if (this.performerService.performer.firstName) {
          // Set form to read only
          this.profileForm.disable();
        }

        // Handling of Stripe redirecting if performer hasn't signed up yet
        if (
          this.stripeState === this.performerService.performer.state &&
          !this.performerService.isStripeAccountLinked
        ) {
          // Show spinner stating link of stripe accounts in progress
          this.stripeLinkInProgress = true;

          // Setup local variables for http request
          let performerId = localStorage.getItem("performerSub");
          let performerState = this.performerService.performer.state;

          // If stripe didn't return an error
          if (this.stripeError === null) {
            this.stripeService
              .linkStripeAccounts(
                this.stripeState,
                this.stripeAuthCode,
                performerId,
                performerState
              )
              .subscribe((res: any) => {
                // Update performer service values
                this.performerService.performer = res.performer;
                this.performerService.isStripeAccountLinked = true;

                // Stop spinner and present a message saying stripe account setup
                this.stripeLinkInProgress = false;
                this.stripeLinkComplete = true;
              });
          }
          // If stripe did return an error stop the spinner so that the performer can retry
          else {
            this.stripeLinkInProgress = false;
          }
        }
      } else {
        // if performer performer hasn't signed a eula yet, show EULA component
        this.promptEndUserLicenseAgreement();
      }
    });
  }

  promptEndUserLicenseAgreement() {
    let dialogRef = this.dialog.open(EndUserLicenseAgreementComponent, {
      width: "400px",
      autoFocus: false,
      data: {
        dialogTitle: "End User License Agreement",
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        // show snack bar saying end user agreement successfully signed
        let message = translate(
          "profile.end-user-license-agreement-success-message"
        );
        let snackBarRef = this._snackBar.open(message, "Dismiss", {
          duration: 4000,
          verticalPosition: "top",
        });

        snackBarRef.afterDismissed().subscribe(() => {
          snackBarRef = null;
        });
      }
      dialogRef = null;
    });
  }

  get isSmallScreen() {
    return this.breakpointObserver.isMatched("(max-width: 450px)");
  }

  get isLargeScreen() {
    return this.breakpointObserver.isMatched("(min-width: 700px)");
  }

  prepCreationOfPerformer() {
    // update performer db entry with new values
    let performer: any = {};
    Object.assign(
      performer,
      this.performerService.performer,
      this.profileForm.value
    );
    return this.performerService.updatePerformer(performer.id, performer);
  }

  submit() {
    this.prepCreationOfPerformer().subscribe(
      (res: any) => {
        // save the performer
        this.performerService.performer = res.response;
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
          this.performerService.performer = performer.response;
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
    let defaultValue = "n/a";
    performer.firstName = defaultValue;
    performer.lastName = defaultValue;
    performer.bio = defaultValue;
    performer.email = defaultValue;
    performer.endEventMessage = defaultValue;
    performer.instrumentOfChoice = defaultValue;
    performer.phone = defaultValue;
    performer.isAccountDeleted = true;

    this.performerService.updatePerformer(performer.id, performer).subscribe(
      (res: any) => {
        // update performer
        this.performerService.performer = res.response;

        // Reset form to display view
        this.profileForm.patchValue(this.performerService.performer);

        let message = "Personal data deleted successfully";
        let snackBarRef = this._snackBar.open(message, "Dismiss", {
          duration: 2000,
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
          if (
            this.performerService.isSignedUp ||
            this.performerService.performer.signedEndUserLicenseAgreement
          ) {
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
