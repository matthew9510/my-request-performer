import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { Requests } from '../../interfaces/requests';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


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

  constructor(
    private requestsService: RequestsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.onFetchRequests()
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
