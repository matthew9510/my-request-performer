import { Component, OnInit, Inject, Optional } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { Requests } from '../../interfaces/requests';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  pendingRequests: any;
  acceptedRequests: any;

  // not sure if this will be necessary once we are able to do patch requests
  updatedStatus: string = '';

  // now playing request is hard coded for now. there will be only one request with the status 'now-playing' at any given time
  nowPlayingRequest = {
    song: 'Piano Man',
    artist: 'Billy Joel',
    amount: 1.00
  }
  confirmDiaglogTitle: string = 'Reject Request?';
  confirmDiaglogMessage: string = 'Are you sure you want to reject this request? This action cannot be undone.';
  confirmDialogAction: string = 'Reject';
  

  constructor(
    private requestsService: RequestsService,
    public dialog: MatDialog
    ) { }


  ngOnInit() {
    this.onFetchRequests()
  }

  // may need to pass in request_id as well to be able to change the status
  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {title: this.confirmDiaglogTitle, message: this.confirmDiaglogMessage, action: this.confirmDialogAction}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // not sure yet which method will go here
        this.changeStatus('rejected');
      };
    });
  }

    // might not need all 3 of these methods. these methods originally existed on request-details.
    changeStatus(status) {
      this.updatedStatus = status;
    }
    rejectRequest() {
      this.changeStatus('rejected');
    }
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
