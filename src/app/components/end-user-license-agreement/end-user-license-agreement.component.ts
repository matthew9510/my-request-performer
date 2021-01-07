import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { AuthService } from "@services/auth.service";
import { PerformerService } from "@services/performer.service";
import { environment } from "../../../environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { retry } from "rxjs/operators";

@Component({
  selector: "app-end-user-license-agreement",
  templateUrl: "./end-user-license-agreement.component.html",
  styleUrls: ["./end-user-license-agreement.component.scss"],
})
export class EndUserLicenseAgreementComponent implements OnInit {
  @ViewChild("scroll", { static: false, read: ElementRef })
  public scroll: ElementRef<any>;
  title: string;
  loading = false;
  showSubmitErrorMessage = false;
  submitErrorMessage: string;
  appEmail: string;
  landingPageUrl: string;

  constructor(
    public dialogRef: MatDialogRef<EndUserLicenseAgreementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public performerService: PerformerService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.title = this.data.dialogTitle;
    this.appEmail = environment.appEmail;
    this.landingPageUrl = environment.landingPageUrl;
  }

  cancelHandler() {
    // close this dialog spun up from profile component
    this.dialogRef.close();
    // Log user out if they can't or don't want to sign eula
    this.authService.logout();
  }

  submitHandler() {
    // Show spinner
    this.loading = true;

    // Preparation of payload
    // Access AWS cognito performer email and phone number details
    let performerAwsData = this.authService.performerAuthState.user.attributes;
    let performerId = localStorage.getItem("performerSub");
    let payload = {
      id: performerId,
      signedEndUserLicenseAgreement: true,
      email: performerAwsData.email,
      phone: performerAwsData.phone_number,
    };

    // save performer eula signature in db and attach Aws IOT permissions
    this.performerService
      .createPerformer(payload, this.authService.performerIdentityId)
      .pipe(retry(1))
      .subscribe(
        (res: any) => {
          // Assign performerService values
          this.performerService.performer = res.record;

          //Assign local storage
          localStorage.setItem(
            "performerSignedEndUserLicenseAgreement",
            "true"
          );

          // Hide spinner
          this.loading = false;

          // Close the dialog
          this.dialogRef.close(true);
        },
        (err: any) => {
          // update component flags
          this.loading = false;

          // set component flags to present that an error occurred to user
          this.showSubmitErrorMessage = true;
          this.submitErrorMessage =
            "Error submitting, please try again in a few minutes.";

          // log error incase user is curious about opening console
          console.log(err.error.message);
        }
      );
  }
}
