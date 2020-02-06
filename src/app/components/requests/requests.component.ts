import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { Requests } from '../../interfaces/requests';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  pendingRequests: any;
  acceptedRequests: any;
  updatedStatus: string = '';
  nowPlayingRequest = {
    song: 'Piano Man',
    artist: 'Billy Joel',
    amount: 1.00
  }

  animal: string;
  name: string;

  constructor(
    private requestsService: RequestsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.onFetchRequests()
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: {name: this.name, animal: this.animal}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

    // move to requests component
    changeStatus(status) {
      this.updatedStatus = status;
    }
   // move to requests component
    rejectRequest() {
      this.changeStatus('rejected');
    }
    // move to requests component
    acceptRequest() {
      this.changeStatus('accepted');
    }

  onFetchRequests() {
    this.requestsService.fetchPendingRequests()
      .subscribe((res: Requests[]) => this.pendingRequests = res);
    this.requestsService.fetchAcceptedRequests()
      .subscribe((res: Requests[]) => this.acceptedRequests = res);
  }

  onChangeStatus(status) {
    console.log(status)
    this.updatedStatus = status;
    // not finished yet - waiting on backend set up
    this.onPatchRequestStatus(this.updatedStatus, 'requestId')
  }

  // not finished yet - waiting on backend set up
  onPatchRequestStatus(newStatus, requestId) {
    this.requestsService.patchRequestStatus(newStatus, requestId)
      .subscribe((res => 
        { console.log(res); 
          this.onFetchRequests();
        }));
  }

}
