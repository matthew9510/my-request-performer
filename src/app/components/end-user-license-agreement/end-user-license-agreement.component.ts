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
  constructor(
    public dialogRef: MatDialogRef<EndUserLicenseAgreementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public performerService: PerformerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.title = this.data.dialogTitle;
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

    // save that performer accepts eula in db
    this.performerService.createPerformer(payload).subscribe(
      (res: any) => {
        // Assign performerService values
        this.performerService.performer = res.record;

        //Assign local storage
        localStorage.setItem("performerSignedEndUserLicenseAgreement", "true");

        // Hide spinner
        this.loading = false;

        // Close the dialog
        this.dialogRef.close(true);
      },
      (err) => {
        this.showSubmitErrorMessage = true;
        this.submitErrorMessage = "Error submitting try again.";
        this.loading = false;
        console.error(err);
      }
    );
  }
}
