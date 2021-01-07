import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-generic-error-modal",
  templateUrl: "./generic-error-modal.component.html",
  styleUrls: ["./generic-error-modal.component.scss"],
})
export class GenericErrorModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<GenericErrorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  closeDialog() {
    this.dialogRef.close(false);
  }
}
