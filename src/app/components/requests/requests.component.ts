import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { translate } from '@ngneat/transloco';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  // not sure if this will be necessary once we are able to do patch requests
  updatedStatus: string = '';

  // now playing request is hard coded for now. there will be only one request with the status 'now-playing' at any given time
  nowPlayingRequest = {
    song: 'Piano Man',
    artist: 'Billy Joel',
    amount: 1.00,
    currentlyPlaying: true
  }


  constructor(
    private requestsService: RequestsService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) { }


  ngOnInit() {
    this.requestsService.onFetchRequests();
  }

  get isLargeScreen() {
    return this.breakpointObserver.isMatched('(min-width: 700px)');
  }

  endCurrentSong() {
    this.nowPlayingRequest = {
      song: null,
      artist: null,
      amount: null,
      currentlyPlaying: false
    }
  };


  // may need to pass in request_id as well to be able to change the status
  openDialog(index, requestType): void {
    const message = translate('confirm dialog message');
    const title = translate('confirm dialog title');
    const action = translate('confirm dialog action');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        // need to find out how to use transloco on these msg strings
        title,
        message,
        action
        // title: 'Reject Request?',
        // message: 'Are you sure you want to reject this request? This action cannot be undone.',
        // action: 'Reject'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rejectRequest(index, requestType);
      };
    });
  }

  rejectRequest(index, requestType) {
    if (requestType === 'acceptedRequests') {
      this.requestsService.acceptedRequests.splice(index, 1);
    }
    if (requestType === 'pendingRequests') {
      this.requestsService.pendingRequests.splice(index, 1);
    }
  }

  playNext(index) {
    this.nowPlayingRequest = {
      song: this.requestsService.acceptedRequests[index].song,
      artist: this.requestsService.acceptedRequests[index].artist,
      amount: this.requestsService.acceptedRequests[index].amount,
      currentlyPlaying: true
    }
    this.rejectRequest(index, 'acceptedRequests');
  }

  acceptRequest(index) {
    this.requestsService.acceptedRequests.push(this.requestsService.pendingRequests[index]);
    this.rejectRequest(index, 'pendingRequests');
  }

  // these methods were used to grab the request data from the requests JSON files, may be reusable once backend is set up

  // onFetchRequests() {
  //   this.requestsService.fetchPendingRequests()
  //     .subscribe((res: Requests[]) => this.pendingRequests = res);
  //   this.requestsService.fetchAcceptedRequests()
  //     .subscribe((res: Requests[]) => this.acceptedRequests = res);
  // }

  // onChangeStatus(status) {
  //   console.log(status)
  //   this.updatedStatus = status;
  //   this.onPatchRequestStatus(this.updatedStatus, 'requestId')
  // }

  // not finished yet - waiting on backend set up
  // onPatchRequestStatus(newStatus, requestId) {
  //   this.requestsService.patchRequestStatus(newStatus, requestId)
  //     .subscribe((res => {
  //       console.log(res);
  //       this.onFetchRequests();
  //     }));
  // }

}
