import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  title: string;
  message: string;
  action: string;
  requestInfo = {
    index: null,
    requestType: '',
  }

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.title = this.data.title;
    this.message = this.data.message;
    this.action = this.data.action;
    this.requestInfo.index = this.data.index;
    this.requestInfo.requestType = this.data.requestType;
  }

  confirmDialog() {
    this.dialogRef.close(this.requestInfo)
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

}